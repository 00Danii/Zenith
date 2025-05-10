import { WallpaperGrid } from "@/components/wallpaper-grid";
import React from "react";

function FondosPage() {
  return (
    <div className="w-full h-auto px-5 @lg:px-12 lg:px-20 pt-16">
      <section className="">
        {/* <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold ">
          Home
        </h2> */}

        <p className="text-base/relaxed pt-5 mx-5"></p>

        <WallpaperGrid />
      </section>
    </div>
  );
}

export default FondosPage;
