import { images } from "@/lib/images";
import Image from "next/image";

export default function SidebarImage() {
  return (
    <div className="hidden md:block md:w-1/2 overflow-hidden rounded-r-2xl">
      <Image
        src={images.room}
        alt="Welcome to Hostella"
        className="w-full h-full object-cover"
      />
    </div>
  );
}
