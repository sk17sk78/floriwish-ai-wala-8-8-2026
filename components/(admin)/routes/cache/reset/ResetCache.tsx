// icons
import { CloudLightning, DatabaseZap, ListRestart, Zap } from "lucide-react";

// requests
import { resetAllCache } from "./requests/resetAllCache";
import { resetRedisCache } from "./requests/resetRedisCache";
import { resetNextCache } from "./requests/resetNextCache";
import { resetCloudfrontCache } from "./requests/resetCloudfrontCache";

// components
import ResetCacheButton from "./components/ResetCacheButton";

export default function ResetCache() {
  return (
    <section className="flex items-center justify-center w-full h-full p-6">
      <section className="flex flex-col items-center gap-6 max-w-4xl">
        <h2 className="text-2xl font-bold text-zinc-800">Cache Reset Management</h2>
        <section className="flex items-center justify-center flex-wrap gap-5">
          <ResetCacheButton
            label="Full Website Reset"
            icon={
              <ListRestart
                width={26}
                height={26}
              />
            }
            onClick={resetAllCache}
          />
          <ResetCacheButton
            label="Redis Cache"
            icon={
              <DatabaseZap
                width={26}
                height={26}
              />
            }
            onClick={resetRedisCache}
          />
          <ResetCacheButton
            label="Next.js Cache"
            icon={
              <Zap
                width={26}
                height={26}
              />
            }
            onClick={resetNextCache}
          />
          <ResetCacheButton
            label="Cloudfront CDN"
            icon={
              <CloudLightning
                width={26}
                height={26}
              />
            }
            onClick={resetCloudfrontCache}
          />
        </section>
      </section>
    </section>
  );
}
