<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGCodeRequest;
use App\Http\Requests\UpdateGCodeRequest;
use App\Models\GCode;
use Illuminate\Http\Request;

class GCodeController extends Controller
{
    /**
     * GET /api/g-codes
     * Supports: ?search=code&agency_id=1&per_page=20
     */
    public function index(Request $request)
    {
        $query = GCode::query()->with('agency');

        if ($search = $request->query('search')) {
            $query->where('code', 'like', "%{$search}%");
        }

        if ($agencyId = $request->query('agency_id')) {
            $query->where('agency_id', $agencyId);
        }

        $perPage = (int) $request->query('per_page', 20);

        return $query->orderBy('code')->paginate($perPage);
    }

    /**
     * GET /api/g-codes/{gCode}
     */
    public function show(GCode $gCode)
    {
        return $gCode->load('agency');
    }

    /**
     * POST /api/g-codes
     */
    public function store(StoreGCodeRequest $request)
    {
        $gCode = GCode::create($request->validated());

        return response()->json($gCode->load('agency'), 201);
    }

    /**
     * PUT/PATCH /api/g-codes/{gCode}
     */
    public function update(UpdateGCodeRequest $request, GCode $gCode)
    {
        $gCode->update($request->validated());

        return response()->json($gCode->fresh('agency'));
    }

    /**
     * DELETE /api/g-codes/{gCode}
     */
    public function destroy(GCode $gCode)
    {
        $gCode->delete();

        return response()->json(['message' => 'G-Code deleted.']);
    }
}
