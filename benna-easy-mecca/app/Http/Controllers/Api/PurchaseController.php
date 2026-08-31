<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePurchaseRequest;
use App\Models\GCode;
use App\Models\PurchaseItem;
use App\Models\PurchaseMaster;
use App\Services\DocumentNumberService;
use App\Services\ItemAmountCalculator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class PurchaseController extends Controller
{
    public function index()
    {
        return PurchaseMaster::with(['agency', 'gCode', 'items'])
            ->orderByDesc('purchase_date')
            ->paginate(20);
    }

    public function show(PurchaseMaster $purchase)
    {
        return $purchase->load(['agency', 'gCode', 'items', 'attachments']);
    }

    public function storePurchase(StorePurchaseRequest $request)
    {
        $validated = $request->validated();

        $purchase = DB::transaction(function () use ($validated) {
            $gCode = GCode::findOrFail($validated['g_code_id']);

            $financialYear = Carbon::parse($validated['purchase_date'])->year;
            $purchaseNo = DocumentNumberService::next('PUR', (string) $financialYear);

            $purchaseMaster = PurchaseMaster::create([
                'purchase_no' => $purchaseNo,
                'purchase_date' => $validated['purchase_date'],
                'agency_id' => $gCode->agency_id,
                'g_code_id' => $gCode->id,
                'notes' => $validated['notes'] ?? null,
                'total_amount' => 0,
            ]);

            $total = 0;

            foreach ($validated['items'] as $item) {
                $amount = ItemAmountCalculator::calculate($item['item_type'], $item['details']);
                $total += $amount;

                PurchaseItem::create([
                    'purchase_master_id' => $purchaseMaster->id,
                    'item_type' => $item['item_type'],
                    'details' => $item['details'],
                    'note' => $item['note'] ?? null,
                    'amount' => $amount,
                ]);
            }

            $purchaseMaster->update(['total_amount' => $total]);

            return $purchaseMaster->load('items');
        });

        return response()->json($purchase, 201);
    }
}
