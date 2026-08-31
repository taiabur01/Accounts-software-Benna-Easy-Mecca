<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInvoiceRequest;
use App\Models\GCode;
use App\Models\InvoiceItem;
use App\Models\InvoiceMaster;
use App\Services\DocumentNumberService;
use App\Services\ItemAmountCalculator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    public function index()
    {
        return InvoiceMaster::with(['agency', 'gCode', 'items'])
            ->orderByDesc('invoice_date')
            ->paginate(20);
    }

    public function show(InvoiceMaster $invoice)
    {
        return $invoice->load(['agency', 'gCode', 'items', 'attachments']);
    }

    public function storeInvoice(StoreInvoiceRequest $request)
    {
        $validated = $request->validated();

        $invoice = DB::transaction(function () use ($validated) {
            $gCode = GCode::findOrFail($validated['g_code_id']);

            $financialYear = Carbon::parse($validated['invoice_date'])->year;
            $invoiceNo = DocumentNumberService::next('INV', (string) $financialYear);

            $invoiceMaster = InvoiceMaster::create([
                'invoice_no' => $invoiceNo,
                'invoice_date' => $validated['invoice_date'],
                'agency_id' => $gCode->agency_id,
                'g_code_id' => $gCode->id,
                'notes' => $validated['notes'] ?? null,
                'total_amount' => 0,
            ]);

            $total = 0;

            foreach ($validated['items'] as $item) {
                $amount = ItemAmountCalculator::calculate($item['item_type'], $item['details']);
                $total += $amount;

                InvoiceItem::create([
                    'invoice_master_id' => $invoiceMaster->id,
                    'item_type' => $item['item_type'],
                    'details' => $item['details'],
                    'note' => $item['note'] ?? null,
                    'amount' => $amount,
                ]);
            }

            $invoiceMaster->update(['total_amount' => $total]);

            return $invoiceMaster->load('items');
        });

        return response()->json($invoice, 201);
    }
}
