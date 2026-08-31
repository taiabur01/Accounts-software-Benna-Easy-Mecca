<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\PurchaseController;
use App\Http\Controllers\Api\PaymentController;


use App\Http\Controllers\Api\AgencyController;
use App\Http\Controllers\Api\GCodeController;


Route::apiResource('agencies', AgencyController::class);
Route::apiResource('g-codes', GCodeController::class)->parameters([
    'g-codes' => 'g_code',
]);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('invoices')->group(function () {
    Route::get('/', [InvoiceController::class, 'index']);
    Route::get('/{invoice}', [InvoiceController::class, 'show']);
    Route::post('/', [InvoiceController::class, 'storeInvoice']);
});

Route::prefix('purchases')->group(function () {
    Route::get('/', [PurchaseController::class, 'index']);
    Route::get('/{purchase}', [PurchaseController::class, 'show']);
    Route::post('/', [PurchaseController::class, 'storePurchase']);
});

Route::prefix('payments')->group(function () {
    Route::get('/', [PaymentController::class, 'index']);
    Route::post('/', [PaymentController::class, 'storePayment']);
});