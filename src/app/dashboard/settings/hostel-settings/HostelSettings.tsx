"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Loader2, Building } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Skeleton from "@/components/ui/skeleton";
import BasicInfoSection from "./components/BasicInfoSection";
import ContactSection from "./components/ContactSection";
import AvailableRoomsSection from "./components/AvailableRoomsSection";
import DescriptionSection from "./components/DescriptionSection";
import FacilitiesSection from "./components/FacilitiesSection";

interface RoomType {
  type: string;
  title: string;
  value: string;
  total: number;
  available: number;
  price: number;
}

interface Room {
  id: string;
  roomNumber: string;
  floorNumber: number;
  capacity: number;
  price: number;
  status: string;
  genderType: string | null;
  type: string | null;
  currentOccupants: number;
  availableSpots: number;
  occupancyStatus: "available" | "partially_available" | "full";
  colorCode: "default" | "green" | "red";
  images: string[];
}

interface HostelData {
  id: string;
  name: string;
  location: string;
  campus: string;
  phoneNumber: string;
  facilities: string[];
  description: string | null;
  noOfFloors?: string;
  roomTypes?: RoomType[];
  singleRooms: number;
  doubleRooms: number;
  tripleRooms: number;
  availableSingleRooms?: number;
  availableDoubleRooms?: number;
  availableTripleRooms?: number;
  rooms?: Room[];
}

export default function HostelSettings() {
  const user = useAuthStore((s) => s.user);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hostel, setHostel] = useState<HostelData | null>(null);
  const [resolvedId, setResolvedId] = useState<string | null>(null);

  const initialStoreId = user?.assignedHostels?.[0]?.id || user?.hostelId;

  const resolveAndFetch = React.useCallback(
    async (isRetry = false) => {
      setLoading(true);
      setError(null);
      let currentId = initialStoreId;
      let hostelDataFromApi: HostelData | null = null;
      let successfullyLoaded = false;

      console.log(
        "[HostelSettings] Resolving hostel. isRetry:",
        isRetry,
        "Store ID:",
        currentId
      );

      try {
        // Step 0: If retry, refresh profile first to get latest assignments
        if (isRetry || !currentId) {
          console.log("[HostelSettings] refreshing profile...");
          await fetchProfile();
          // Re-read user from store state after refresh
          const updatedUser = useAuthStore.getState().user;
          currentId =
            updatedUser?.assignedHostels?.[0]?.id || updatedUser?.hostelId;
          console.log("[HostelSettings] Profile refreshed. New ID:", currentId);
        }

        // Step 1: Try /my-hostels (Primary source)
        try {
          console.log("[HostelSettings] Fetching /my-hostels...");
          const response = await apiFetch<{
            success: boolean;
            data: { hostels?: HostelData[] } | HostelData[] | HostelData;
          }>("/hostels/my-hostels");
          console.log("[HostelSettings] /my-hostels response:", response);

          if (response?.success && response.data) {
            const rawData = response.data;

            // Case A: Nested structure { data: { hostels: [...] } }
            if (
              typeof rawData === "object" &&
              !Array.isArray(rawData) &&
              rawData !== null &&
              "hostels" in rawData
            ) {
              const hostels = (rawData as { hostels: HostelData[] }).hostels;
              if (Array.isArray(hostels) && hostels.length > 0) {
                hostelDataFromApi = hostels[0];
              }
            }
            // Case B: Direct array { data: [...] }
            else if (Array.isArray(rawData) && rawData.length > 0) {
              hostelDataFromApi = rawData[0];
            }
            // Case C: Direct object { data: { ... } }
            else if (
              rawData &&
              typeof rawData === "object" &&
              !Array.isArray(rawData) &&
              !("hostels" in rawData)
            ) {
              // Handle data: { hostel: { ... } } or data: { ...hostel }
              const obj = rawData as Record<string, unknown>;
              if (obj.hostel && typeof obj.hostel === "object") {
                hostelDataFromApi = obj.hostel as HostelData;
              } else {
                hostelDataFromApi = rawData as HostelData;
              }
            }

            if (hostelDataFromApi?.id) {
              currentId = hostelDataFromApi.id;
              console.log(
                "[HostelSettings] Successfully extracted hostel data. ID:",
                currentId
              );

              const hData = hostelDataFromApi;
              const roomsArr = hData.rooms || [];

              // Debug logging for availability
              console.log(
                "[HostelSettings] Calculating availability. Total Rooms:",
                roomsArr.length
              );

              console.log(
                "[HostelSettings] Calculating availability. Total Rooms:",
                roomsArr.length
              );

              // 1. Try to fetch members to count occupancy manually as requested
              let singleOccupied = 0;
              let doubleOccupied = 0;
              try {
                const membersResp = await apiFetch<{
                  success: boolean;
                  data: Record<string, unknown> | Array<Record<string, unknown>>;
                }>("/members?pageSize=1000");
                const membersList = Array.isArray(membersResp.data)
                  ? membersResp.data
                  : (membersResp.data && typeof membersResp.data === 'object' && 'members' in membersResp.data) 
                    ? (membersResp.data as Record<string, unknown>).members as Array<Record<string, unknown>>
                    : [];

                console.log(
                  "[HostelSettings] Fetched members for calculation:",
                  membersList.length
                );

                membersList.forEach((m: Record<string, unknown>) => {
                  const status = String(m.status || "").toUpperCase();
                  if (status === "ROOM_ALLOCATED" || status === "APPROVED") {
                    const type = String(
                      (m.preferredRoomType || m.roomTitle) || ""
                    ).toUpperCase();
                    if (type === "SINGLE" || type === "ONE-IN-ONE") {
                      singleOccupied++;
                    } else if (type === "DOUBLE" || type === "TWO-IN-ONE") {
                      doubleOccupied++;
                    }
                  }
                });
                console.log(
                  "[HostelSettings] Manual Occupancy -> Single:",
                  singleOccupied,
                  "Double:",
                  doubleOccupied
                );
              } catch (_mErr) {
                console.warn(
                  "[HostelSettings] Failed to fetch members for manual calc"
                );
              }

              // Triple room support
              const tripleOccupied = Array.isArray(hData.rooms)
                ? hData.rooms.filter((r) => (r.type?.toUpperCase() === "TRIPLE" || r.type?.toUpperCase() === "TP")).reduce((acc, r) => acc + (r.currentOccupants || 0), 0)
                : 0;
              const availSingle = Math.max(
                0,
                (hData.singleRooms || 0) - singleOccupied
              );
              const availDouble = Math.max(
                0,
                (hData.doubleRooms || 0) - doubleOccupied
              );
              const availTriple = Math.max(
                0,
                (hData.tripleRooms || 0) - tripleOccupied
              );

              setHostel({
                ...hData,
                description: hData.description || "",
                facilities: Array.isArray(hData.facilities)
                  ? hData.facilities
                  : [],
                phoneNumber: hData.phoneNumber || "",
                noOfFloors: String(hData.noOfFloors || "0"),
                singleRooms: hData.singleRooms || 0,
                doubleRooms: hData.doubleRooms || 0,
                tripleRooms: hData.tripleRooms || 0,
                availableSingleRooms: availSingle,
                availableDoubleRooms: availDouble,
                availableTripleRooms: availTriple,
              });
              setResolvedId(currentId);
              successfullyLoaded = true;
              setLoading(false);
              return;
            } else {
              console.warn(
                "[HostelSettings] Could not find valid ID in /my-hostels data:",
                rawData
              );
            }
          }
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          console.warn("[HostelSettings] /my-hostels failed:", msg);
        }

        // Step 2: Fallback to direct ID fetch if step 1 failed
        if (currentId) {
          setResolvedId(currentId);
          console.log(
            `[HostelSettings] Falling back to detail fetch for ID: ${currentId}...`
          );
          const response = await apiFetch<{
            success: boolean;
            data: HostelData;
          }>(`/hostels/${currentId}`);
          if (response.success && response.data) {
            const rawDetail = response.data;
            let detailHostel: HostelData;

            if (
              typeof rawDetail === "object" &&
              rawDetail !== null &&
              "hostel" in rawDetail
            ) {
              const obj = rawDetail as Record<string, unknown>;
              if (obj.hostel && typeof obj.hostel === "object") {
                detailHostel = obj.hostel as HostelData;
              } else {
                detailHostel = rawDetail as HostelData;
              }
            } else {
              detailHostel = rawDetail as HostelData;
            }

            // Manual calculation for fallback as well
            let singleOccupied = 0;
            let doubleOccupied = 0;
            try {
              const membersResp = await apiFetch<{
                success: boolean;
                data: Record<string, unknown> | Array<Record<string, unknown>>;
              }>("/members?pageSize=1000");
              const membersList = Array.isArray(membersResp.data)
                ? membersResp.data
                : (membersResp.data && typeof membersResp.data === 'object' && 'members' in membersResp.data)
                  ? (membersResp.data as Record<string, unknown>).members as Array<Record<string, unknown>>
                  : [];

              membersList.forEach((m: Record<string, unknown>) => {
                const status = String(m.status || "").toUpperCase();
                if (status === "ROOM_ALLOCATED" || status === "APPROVED") {
                  const type = String(
                    (m.preferredRoomType || m.roomTitle) || ""
                  ).toUpperCase();
                  if (type === "SINGLE" || type === "ONE-IN-ONE") {
                    singleOccupied++;
                  } else if (type === "DOUBLE" || type === "TWO-IN-ONE") {
                    doubleOccupied++;
                  }
                }
              });
            } catch (mErr) {
              console.warn(
                "[HostelSettings] Fallback member fetch failed:",
                mErr
              );
            }

            // Triple room support (fallback)
            const tripleOccupied = Array.isArray(detailHostel.rooms)
              ? detailHostel.rooms.filter((r) => (r.type?.toUpperCase() === "TRIPLE" || r.type?.toUpperCase() === "TP")).reduce((acc, r) => acc + (r.currentOccupants || 0), 0)
              : 0;
            const availSingle = Math.max(
              0,
              (detailHostel.singleRooms || 0) - singleOccupied
            );
            const availDouble = Math.max(
              0,
              (detailHostel.doubleRooms || 0) - doubleOccupied
            );
            const availTriple = Math.max(
              0,
              (detailHostel.tripleRooms || 0) - tripleOccupied
            );

            setHostel({
              ...detailHostel,
              description: detailHostel.description || "",
              facilities: Array.isArray(detailHostel.facilities)
                ? detailHostel.facilities
                : [],
              phoneNumber: detailHostel.phoneNumber || "",
              noOfFloors: String(detailHostel.noOfFloors || "0"),
              singleRooms: detailHostel.singleRooms || 0,
              doubleRooms: detailHostel.doubleRooms || 0,
              tripleRooms: detailHostel.tripleRooms || 0,
              availableSingleRooms: availSingle,
              availableDoubleRooms: availDouble,
              availableTripleRooms: availTriple,
            });
            setResolvedId(currentId);
            successfullyLoaded = true;
            setLoading(false);
            return;
          }
        }

        // Final Check
        if (!currentId) {
          setError(
            "No hostel assigned to your account. Please contact the administrator."
          );
        } else if (!successfullyLoaded) {
          setError("Details not found for your assigned hostel.");
        }
      } catch (err: unknown) {
        console.error("[HostelSettings] Resolve error:", err);
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    },
    [initialStoreId, fetchProfile]
  );

  useEffect(() => {
    resolveAndFetch();
  }, [resolveAndFetch]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2 text-blue-600">
              <Building className="h-5 w-5" />
              Hostel Information
            </CardTitle>
            <p className="text-sm text-gray-500 font-normal">
              Loading your hostel details...
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Basic Info & Contact Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info Skeleton */}
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
                {/* Contact Skeleton */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </div>

              {/* Available Rooms Skeleton */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <Skeleton className="h-5 w-32" />
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2 p-4 rounded-lg border">
                      <Skeleton className="h-6 w-16 mx-auto" />
                      <Skeleton className="h-10 w-12 mx-auto" />
                      <Skeleton className="h-3 w-24 mx-auto" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Description Skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-32 w-full" />
              </div>

              {/* Facilities Skeleton */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <Skeleton className="h-4 w-32" />
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-8 w-24 rounded-full" />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !resolvedId) {
    return (
      <Card className="border-red-100 bg-red-50 p-8 text-center space-y-4">
        <div className="flex justify-center">
          <Building className="h-12 w-12 text-red-300" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-red-800">
            Assignment Error
          </h3>
          <p className="text-red-600 max-w-md mx-auto">
            {error ||
              "No hostel assigned to your account. This may happen if the backend route is still refreshing."}
          </p>
        </div>
        <div className="pt-2">
          <Button
            onClick={() => resolveAndFetch(true)}
            variant="outline"
            className="border-red-200 text-red-700 hover:bg-red-100 gap-2"
          >
            <Loader2 className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Retry Sync
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-blue-600">
            <Building className="h-5 w-5" />
            Hostel Information
          </CardTitle>
          <p className="text-sm text-gray-500 font-normal">
            View your hostel details and facilities visible to students. These
            details are managed by the administrator.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Basic Info & Contact Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BasicInfoSection
                hostelName={hostel?.name || ""}
                location={hostel?.location || ""}
                campus={hostel?.campus || ""}
                noOfFloors={hostel?.noOfFloors || "0"}
              />
              <ContactSection phoneNumber={hostel?.phoneNumber || ""} />
            </div>

            {/* Available Rooms */}
            <AvailableRoomsSection
              availableSingleRooms={hostel?.availableSingleRooms ?? 0}
              availableDoubleRooms={hostel?.availableDoubleRooms ?? 0}
              availableTripleRooms={hostel?.availableTripleRooms ?? 0}
            />

            {/* Description */}
            <DescriptionSection description={hostel?.description || ""} />

            {/* Facilities */}
            <FacilitiesSection
              facilities={hostel?.facilities || []}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
