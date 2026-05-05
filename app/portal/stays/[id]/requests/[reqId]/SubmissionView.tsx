'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Pencil } from 'lucide-react'
import type { RequestStatus } from '@prisma/client'
import { RequestForm } from './RequestForm'

type DocumentKind =
  | 'PASSPORT'
  | 'CONTRACT'
  | 'RECEIPT'
  | 'ID'
  | 'INSURANCE'
  | 'PET_DOC'
  | 'OTHER'

interface Props {
  bookingId: string
  requestId: string
  status: Extract<RequestStatus, 'PENDING_REVIEW' | 'FULFILLED'>
  expectsDocument: boolean
  documentKind: DocumentKind
  textResponse: string | null
  fulfilledAt: string | null
  documents: Array<{ id: string; filename: string; uploadedAt: string }>
}

/**
 * Renter view of an already-submitted request. By default, read-only.
 * Click "Edit" to swap into the form — saving will reset the request
 * to PENDING_REVIEW so the admin re-reviews it.
 */
export function SubmissionView({
  bookingId,
  requestId,
  status,
  expectsDocument,
  documentKind,
  textResponse,
  fulfilledAt,
  documents,
}: Props) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <RequestForm
        bookingId={bookingId}
        requestId={requestId}
        expectsDocument={expectsDocument}
        documentKind={documentKind}
        initialText={textResponse ?? ''}
        isModifying
        onCancel={() => setEditing(false)}
        onSubmitted={() => setEditing(false)}
      />
    )
  }

  const isFulfilled = status === 'FULFILLED'

  return (
    <div className="bg-white border border-stone-200 rounded-xs p-6">
      <div className="flex items-start justify-between gap-4 mb-3">
        <p className="text-xs uppercase tracking-[0.2em] text-stone-500 font-light">
          {isFulfilled
            ? `Approved${fulfilledAt ? ` · ${format(new Date(fulfilledAt), 'MMM d, yyyy')}` : ''}`
            : 'Submitted · awaiting review'}
        </p>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-stone-700 hover:text-stone-900 underline underline-offset-4"
        >
          <Pencil className="w-3 h-3" />
          {expectsDocument ? 'Replace upload' : 'Edit'}
        </button>
      </div>

      {!isFulfilled && (
        <p className="text-stone-700 font-light leading-relaxed mb-4">
          Thanks — we received this and will review it shortly. We&apos;ll let
          you know if we need anything else. You can still make changes
          before review.
        </p>
      )}

      {textResponse && (
        <p className="text-stone-700 font-light whitespace-pre-wrap leading-relaxed border-t border-stone-200 pt-4 mb-4">
          {textResponse}
        </p>
      )}

      {documents.length > 0 && (
        <ul
          className={`space-y-2 ${textResponse ? '' : 'border-t border-stone-200 pt-4'}`}
        >
          {documents.map((d) => (
            <li
              key={d.id}
              className="text-sm font-light text-stone-700 border-t border-stone-100 pt-3 first:border-t-0 first:pt-0 flex justify-between gap-3"
            >
              <span className="truncate">{d.filename}</span>
              <span className="text-xs text-stone-400 whitespace-nowrap">
                {format(new Date(d.uploadedAt), 'MMM d')}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
