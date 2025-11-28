"use client";

import TableFilters from "../../components/_reusable_components/table-filters";

type Props = {
  search: string;
  onSearch: (v: string) => void;
  status: string;
  onStatus: (v: string) => void;
  statusOptions: string[];
  gender: string;
  onGender: (v: string) => void;
  genderOptions: string[];
  room: string;
  onRoom: (v: string) => void;
  roomOptions: string[];
  onReset: () => void;
};

export default function BookingsFilters({
  search,
  onSearch,
  status,
  onStatus,
  statusOptions,
  gender,
  onGender,
  genderOptions,
  room,
  onRoom,
  roomOptions,
  onReset,
}: Props) {
  return (
    <TableFilters
      search={search}
      onSearch={onSearch}
      status={status}
      onStatus={onStatus}
      statusOptions={statusOptions}
      gender={gender}
      onGender={onGender}
      genderOptions={genderOptions}
      room={room}
      onRoom={onRoom}
      roomOptions={roomOptions}
      onReset={onReset}
    />
  );
}
