import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, verifyAdminClient } from '@/lib/supabaseAdmin';
import {
  extractSignatureFromHeader,
  isValidSignatureFormat,
  verifyHmacSignatureWithRotation,
} from '@/lib/hmac';
import { checkRateLimit, extractClientIp } from '@/lib/rateLimit';
import { validateThirdPartyRequest } from '@/lib/validations/thirdPartyApi';
import { filterPatch, validateRequiredFields } from '@/lib/thirdPartyAllowlist';
import {
  checkIdempotency,
  extractIdempotencyKey,
  isValidIdempotencyKey,
  storeIdempotencyResponse,
} from '@/lib/idempotency';
import { logError, logSuccess, startTimer } from '@/lib/logger';

export const runtime = 'nodejs';

/**
 * Third-Party API Route
 * Allows external applications to create, read, and update data in Supabase tables
 * with proper authentication, authorization, and auditing
 */
export async function POST(request: NextRequest) {
  const timer = startTimer();
  let auditEventId: string | undefined;

  try {
    // 1. Feature flag check
    const apiEnabled = process.env.THIRD_PARTY_API_ENABLED !== 'false';
    if (!apiEnabled) {
      logError({
        action: 'third_party_api',
        status: 503,
        error: 'Third-party API is currently disabled for maintenance',
      });
      return NextResponse.json(
        {
          error: 'Service temporarily unavailable',
          message: 'The third-party API is currently disabled for maintenance',
        },
        { status: 503, headers: { 'Retry-After': '3600' } }
      );
    }

    // 2. Verify admin client is configured
    try {
      verifyAdminClient();
    } catch {
      logError({
        action: 'third_party_api',
        status: 500,
        error: 'Server configuration error',
      });
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // 3. Validate Content-Type
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      logError({
        action: 'third_party_api',
        status: 400,
        error: 'Invalid Content-Type, must be application/json',
      });
      return NextResponse.json(
        { error: 'Invalid Content-Type', message: 'Must be application/json' },
        { status: 400 }
      );
    }

    // 4. Get request body as text for HMAC verification
    const bodyText = await request.text();
    let body: unknown;
    try {
      body = JSON.parse(bodyText);
    } catch {
      logError({
        action: 'third_party_api',
        status: 400,
        error: 'Invalid JSON in request body',
      });
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // 5. HMAC Authentication
    const signature = extractSignatureFromHeader(
      request.headers.get('x-signature')
    );
    if (!signature) {
      logError({
        action: 'third_party_api',
        status: 401,
        error: 'Missing X-Signature header',
      });
      return NextResponse.json(
        {
          error: 'Authentication required',
          message: 'Missing X-Signature header',
        },
        { status: 401 }
      );
    }

    if (!isValidSignatureFormat(signature)) {
      logError({
        action: 'third_party_api',
        status: 401,
        error: 'Invalid signature format',
      });
      return NextResponse.json(
        { error: 'Invalid signature format' },
        { status: 401 }
      );
    }

    const activeToken = process.env.THIRD_PARTY_TOKEN_ACTIVE;
    const nextToken = process.env.THIRD_PARTY_TOKEN_NEXT;

    if (!activeToken) {
      logError({
        action: 'third_party_api',
        status: 500,
        error: 'Server configuration error - missing token',
      });
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const hmacResult = verifyHmacSignatureWithRotation(
      signature,
      bodyText,
      activeToken,
      nextToken
    );

    if (!hmacResult.valid) {
      logError({
        action: 'third_party_api',
        status: 401,
        error: 'Invalid signature',
      });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 6. Rate Limiting
    const clientIp = extractClientIp(request.headers);
    const rateLimitKey = `third_party_api:${signature.substring(0, 16)}`; // Use part of signature as key
    const rateLimit = checkRateLimit(rateLimitKey);

    if (!rateLimit.allowed) {
      logError({
        action: 'third_party_api',
        status: 429,
        error: 'Rate limit exceeded',
        metadata: { ip: clientIp, retryAfter: rateLimit.retryAfter },
      });
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: rateLimit.retryAfter },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimit.retryAfter?.toString() || '60',
            'X-RateLimit-Limit': '60',
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
          },
        }
      );
    }

    // 7. Validate request body with Zod
    const validationResult = validateThirdPartyRequest(body);
    if (!validationResult.success) {
      logError({
        action: 'third_party_api',
        status: 400,
        error: validationResult.error || 'Validation error',
      });
      return NextResponse.json(
        { error: 'Validation error', message: validationResult.error },
        { status: 400 }
      );
    }

    const { table, action, id, patch, filters } = validationResult.data!;

    // 8. Idempotency check
    const idempotencyKey = extractIdempotencyKey(request.headers);
    if (idempotencyKey) {
      if (!isValidIdempotencyKey(idempotencyKey)) {
        logError({
          action: 'third_party_api',
          status: 400,
          error: 'Invalid idempotency key format',
        });
        return NextResponse.json(
          { error: 'Invalid idempotency key format' },
          { status: 400 }
        );
      }

      const idempotencyCheck = checkIdempotency(
        idempotencyKey,
        table,
        id,
        bodyText
      );
      if (idempotencyCheck.processed) {
        if (idempotencyCheck.conflict) {
          logError({
            action: 'third_party_api',
            table,
            id,
            status: 409,
            error:
              'Idempotency key conflict - same key used with different data',
          });
          return NextResponse.json(
            {
              error: 'Idempotency key conflict',
              message:
                'This idempotency key was used with different request data',
            },
            { status: 409 }
          );
        }

        // Return cached response
        return NextResponse.json(idempotencyCheck.response, {
          status: 200,
          headers: { 'X-Idempotency-Replay': 'true' },
        });
      }
    }

    // 9. Execute operation based on action
    let result: unknown;
    let recordId: string | undefined;

    if (action === 'create') {
      // CREATE operation
      if (!patch) {
        return NextResponse.json(
          { error: 'Patch data required for create' },
          { status: 400 }
        );
      }

      // Validate required fields
      const missingFields = validateRequiredFields(table, patch);
      if (missingFields.length > 0) {
        logError({
          action: 'create',
          table,
          status: 400,
          error: `Missing required fields: ${missingFields.join(', ')}`,
        });
        return NextResponse.json(
          {
            error: 'Missing required fields',
            fields: missingFields,
          },
          { status: 400 }
        );
      }

      // Filter patch to allowed fields only
      const { allowed, rejected } = filterPatch(table, patch);
      if (Object.keys(allowed).length === 0) {
        logError({
          action: 'create',
          table,
          status: 400,
          error: 'No valid fields to insert',
        });
        return NextResponse.json(
          { error: 'No valid fields to insert', rejectedFields: rejected },
          { status: 400 }
        );
      }

      // Insert record
      const { data, error } = await supabaseAdmin
        .from(table)
        .insert(allowed)
        .select()
        .single();

      if (error) {
        logError({
          action: 'create',
          table,
          status: 500,
          error: `Database error: ${error.message}`,
        });
        return NextResponse.json(
          { error: 'Database error', message: error.message },
          { status: 500 }
        );
      }

      recordId = data?.id;
      result = {
        data,
        rejectedFields: rejected.length > 0 ? rejected : undefined,
      };

      // Log to audit table
      auditEventId = await logAuditEvent({
        actor: 'third_party',
        action: 'create',
        table,
        recordId: recordId || '',
        payload: allowed,
        ip: clientIp,
        userAgent: request.headers.get('user-agent') || undefined,
      });
    } else if (action === 'update') {
      // UPDATE operation
      if (!id) {
        return NextResponse.json(
          { error: 'ID required for update' },
          { status: 400 }
        );
      }

      if (!patch) {
        return NextResponse.json(
          { error: 'Patch data required for update' },
          { status: 400 }
        );
      }

      // Filter patch to allowed fields only
      const { allowed, rejected } = filterPatch(table, patch);
      if (Object.keys(allowed).length === 0) {
        logError({
          action: 'update',
          table,
          id,
          status: 400,
          error: 'No valid fields to update',
        });
        return NextResponse.json(
          { error: 'No valid fields to update', rejectedFields: rejected },
          { status: 400 }
        );
      }

      // Update record
      const { data, error } = await supabaseAdmin
        .from(table)
        .update(allowed)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        // Check if record not found
        if (error.code === 'PGRST116') {
          logError({
            action: 'update',
            table,
            id,
            status: 404,
            error: 'Record not found',
          });
          return NextResponse.json(
            { error: 'Record not found' },
            { status: 404 }
          );
        }

        logError({
          action: 'update',
          table,
          id,
          status: 500,
          error: `Database error: ${error.message}`,
        });
        return NextResponse.json(
          { error: 'Database error', message: error.message },
          { status: 500 }
        );
      }

      recordId = id;
      result = {
        data,
        rejectedFields: rejected.length > 0 ? rejected : undefined,
      };

      // Log to audit table
      auditEventId = await logAuditEvent({
        actor: 'third_party',
        action: 'update',
        table,
        recordId: id,
        payload: allowed,
        ip: clientIp,
        userAgent: request.headers.get('user-agent') || undefined,
      });
    } else if (action === 'read') {
      // READ operation
      let query = supabaseAdmin.from(table).select('*');

      // Apply filters if provided
      if (filters) {
        for (const [key, value] of Object.entries(filters)) {
          query = query.eq(key, value);
        }
      }

      // Apply ID filter if provided
      if (id) {
        const { data, error } = await query.eq('id', id).single();

        if (error) {
          // Check if record not found
          if (error.code === 'PGRST116') {
            logError({
              action: 'read',
              table,
              id,
              status: 404,
              error: 'Record not found',
            });
            return NextResponse.json(
              { error: 'Record not found' },
              { status: 404 }
            );
          }

          logError({
            action: 'read',
            table,
            id,
            status: 500,
            error: `Database error: ${error.message}`,
          });
          return NextResponse.json(
            { error: 'Database error', message: error.message },
            { status: 500 }
          );
        }

        recordId = id;
        result = { data };
      } else {
        const { data, error } = await query;

        if (error) {
          logError({
            action: 'read',
            table,
            status: 500,
            error: `Database error: ${error.message}`,
          });
          return NextResponse.json(
            { error: 'Database error', message: error.message },
            { status: 500 }
          );
        }

        result = { data };
      }

      // Log to audit table
      auditEventId = await logAuditEvent({
        actor: 'third_party',
        action: 'read',
        table,
        recordId: id || '',
        payload: filters || {},
        ip: clientIp,
        userAgent: request.headers.get('user-agent') || undefined,
      });
    }

    // 10. Store idempotency response if key was provided
    if (idempotencyKey && recordId) {
      storeIdempotencyResponse(
        idempotencyKey,
        table,
        recordId,
        bodyText,
        result
      );
    }

    // 11. Log success
    const duration = timer();
    logSuccess({
      action,
      table,
      id: recordId,
      duration,
      auditEventId,
      metadata: {
        ip: clientIp,
        keyUsed: hmacResult.keyUsed,
      } as Record<string, unknown>,
    });

    // 12. Return response with metadata
    const responseData = result as Record<string, unknown>;
    return NextResponse.json(
      {
        success: true,
        ...responseData,
        meta: {
          auditEventId,
          timestamp: new Date().toISOString(),
        },
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Limit': '60',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
        },
      }
    );
  } catch (error) {
    const duration = timer();
    logError({
      action: 'third_party_api',
      status: 500,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration,
    });

    return NextResponse.json(
      {
        error: 'Internal server error',
        message:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.message
              : 'Unknown error'
            : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * Log event to audit_events table
 */
async function logAuditEvent(params: {
  actor: string;
  action: string;
  table: string;
  recordId: string;
  payload: unknown;
  ip?: string;
  userAgent?: string;
}): Promise<string | undefined> {
  try {
    const { data, error } = await supabaseAdmin
      .from('audit_events')
      .insert({
        actor: params.actor,
        action: params.action,
        table_name: params.table,
        record_id: params.recordId,
        payload: params.payload,
        ip: params.ip,
        user_agent: params.userAgent,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to log audit event:', error);
      return undefined;
    }

    return data?.id;
  } catch (error) {
    console.error('Error logging audit event:', error);
    return undefined;
  }
}
