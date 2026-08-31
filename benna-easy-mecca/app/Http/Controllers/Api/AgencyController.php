<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAgencyRequest;
use App\Http\Requests\UpdateAgencyRequest;
use App\Models\Agency;
use Illuminate\Http\Request;

class AgencyController extends Controller
{
    /**
     * GET /api/agencies
     * Supports: ?search=name&agency_type=BD&per_page=20
     */
    public function index(Request $request)
    {
        $query = Agency::query()->withCount('gCodes');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('agency_name', 'like', "%{$search}%")
                    ->orWhere('contact_person', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($type = $request->query('agency_type')) {
            $query->where('agency_type', $type);
        }

        $perPage = (int) $request->query('per_page', 20);

        return $query->orderBy('agency_name')->paginate($perPage);
    }

    /**
     * GET /api/agencies/{agency}
     */
    public function show(Agency $agency)
    {
        return $agency->load('gCodes');
    }

    /**
     * POST /api/agencies
     */
    public function store(StoreAgencyRequest $request)
    {
        $agency = Agency::create($request->validated());

        return response()->json($agency, 201);
    }

    /**
     * PUT/PATCH /api/agencies/{agency}
     */
    public function update(UpdateAgencyRequest $request, Agency $agency)
    {
        $agency->update($request->validated());

        return response()->json($agency->fresh('gCodes'));
    }

    /**
     * DELETE /api/agencies/{agency}
     * Soft delete. Refuses if the agency still has g-codes attached,
     * since invoices/purchases/payments are all reached via g_code_id.
     */
    public function destroy(Agency $agency)
    {
        if ($agency->gCodes()->exists()) {
            return response()->json([
                'message' => 'Cannot delete an agency that still has G-Codes assigned to it. Remove or reassign its G-Codes first.',
            ], 422);
        }

        $agency->delete();

        return response()->json(['message' => 'Agency deleted.']);
    }
}
