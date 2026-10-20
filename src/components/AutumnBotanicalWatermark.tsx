import React from "react";

interface AutumnBotanicalWatermarkProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * AutumnBotanicalWatermark
 * 
 * An original, delicate botanical illustration inspired by a pressed autumn oak/maple leaf.
 * Features intricate hand-drawn venation and organic contours reminiscent of vintage
 * editorial stationery and botanical engravings.
 * 
 * - Fully transparent background (no background rect or fill).
 * - Uses existing design system colors (#B9784E Burnt Sienna & #30231D Deep Espresso).
 * - Rendered with ultra-subtle opacity (~4-5%) for a sophisticated watermark effect.
 * - Non-interactive (pointer-events: none, aria-hidden="true").
 */
export function AutumnBotanicalWatermark({
  className = "",
  style = {},
}: AutumnBotanicalWatermarkProps) {
  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={`absolute pointer-events-none select-none z-0 overflow-visible transition-opacity duration-700 ${className}`}
      style={{
        ...style,
      }}
    >
      <svg
        viewBox="0 0 460 620"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto transform rotate-[-8deg] origin-center"
        style={{
          // Warm Burnt Sienna (#B9784E) at ~4.5% default opacity for the authentic pressed-leaf watermark look
          color: "#B9784E",
        }}
      >
        <g
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Main Rachis / Central Stem - Tapering with organic curve */}
          <path
            d="M 230 600 C 232 540, 235 480, 232 400 C 228 310, 231 220, 227 120 C 225 80, 227 45, 228 20"
            strokeWidth="2.2"
            strokeOpacity="0.85"
          />
          <path
            d="M 230 600 C 229 550, 231 490, 229 420 C 226 340, 228 250, 226 150"
            strokeWidth="1.2"
            strokeOpacity="0.4"
          />

          {/* Leaf Contour / Lobed Margin (Vintage Dried Oak & Maple Blend) */}
          <path
            d="M 228 20
               C 215 32, 195 48, 192 65
               C 188 78, 172 88, 155 96
               C 138 104, 115 110, 110 128
               C 105 145, 120 160, 130 172
               C 112 182, 85 198, 80 220
               C 75 242, 92 260, 108 274
               C 88 288, 62 312, 60 338
               C 58 365, 82 386, 104 398
               C 88 416, 75 442, 80 466
               C 86 490, 112 502, 134 500
               C 152 498, 170 486, 185 470
               C 198 488, 212 512, 228 535
               L 230 550
               C 246 525, 260 500, 272 478
               C 288 494, 308 504, 328 502
               C 350 500, 372 485, 376 460
               C 380 435, 362 412, 344 394
               C 368 382, 394 360, 396 332
               C 398 304, 370 282, 348 268
               C 366 254, 384 235, 380 212
               C 376 188, 348 174, 328 165
               C 338 152, 350 136, 344 120
               C 338 102, 314 96, 298 90
               C 280 82, 266 70, 260 55
               C 255 42, 240 28, 228 20 Z"
            strokeWidth="1.4"
            strokeOpacity="0.75"
          />

          {/* Primary Lateral Veins — Left Side (Gracefully ascending angles) */}
          <path
            d="M 232 460 C 195 448, 160 458, 118 480"
            strokeWidth="1.4"
            strokeOpacity="0.75"
          />
          <path
            d="M 231 390 C 185 372, 140 376, 88 402"
            strokeWidth="1.5"
            strokeOpacity="0.8"
          />
          <path
            d="M 229 320 C 175 296, 128 295, 82 322"
            strokeWidth="1.5"
            strokeOpacity="0.8"
          />
          <path
            d="M 228 250 C 178 222, 136 215, 102 232"
            strokeWidth="1.4"
            strokeOpacity="0.75"
          />
          <path
            d="M 227 185 C 182 158, 148 148, 125 158"
            strokeWidth="1.3"
            strokeOpacity="0.7"
          />
          <path
            d="M 226 130 C 190 108, 165 98, 145 106"
            strokeWidth="1.1"
            strokeOpacity="0.65"
          />
          <path
            d="M 227 80 C 200 62, 185 55, 175 62"
            strokeWidth="0.9"
            strokeOpacity="0.6"
          />

          {/* Primary Lateral Veins — Right Side (Subtly staggered for botanical naturalism) */}
          <path
            d="M 232 445 C 270 435, 305 448, 348 472"
            strokeWidth="1.4"
            strokeOpacity="0.75"
          />
          <path
            d="M 230 375 C 278 358, 322 365, 370 388"
            strokeWidth="1.5"
            strokeOpacity="0.8"
          />
          <path
            d="M 229 305 C 282 284, 328 285, 372 312"
            strokeWidth="1.5"
            strokeOpacity="0.8"
          />
          <path
            d="M 228 238 C 276 214, 318 212, 358 226"
            strokeWidth="1.4"
            strokeOpacity="0.75"
          />
          <path
            d="M 227 175 C 270 150, 305 145, 332 152"
            strokeWidth="1.3"
            strokeOpacity="0.7"
          />
          <path
            d="M 226 122 C 260 102, 288 95, 310 102"
            strokeWidth="1.1"
            strokeOpacity="0.65"
          />
          <path
            d="M 227 75 C 252 58, 270 52, 282 58"
            strokeWidth="0.9"
            strokeOpacity="0.6"
          />

          {/* Secondary Veinlets & Reticulated Capillary Filigree — Left Side */}
          {/* L1 Secondary Veins */}
          <path d="M 185 454 C 172 432, 158 426, 142 432" strokeWidth="0.8" strokeOpacity="0.5" />
          <path d="M 152 462 C 140 445, 126 442, 114 450" strokeWidth="0.7" strokeOpacity="0.45" />
          <path d="M 195 456 C 185 470, 172 478, 155 476" strokeWidth="0.7" strokeOpacity="0.45" />

          {/* L2 Secondary Veins */}
          <path d="M 190 378 C 175 352, 155 348, 132 356" strokeWidth="0.8" strokeOpacity="0.5" />
          <path d="M 148 382 C 130 364, 114 362, 98 375" strokeWidth="0.7" strokeOpacity="0.45" />
          <path d="M 120 392 C 105 382, 92 384, 82 396" strokeWidth="0.6" strokeOpacity="0.4" />
          <path d="M 172 386 C 160 404, 144 412, 125 410" strokeWidth="0.7" strokeOpacity="0.45" />

          {/* L3 Secondary Veins */}
          <path d="M 180 300 C 165 275, 145 270, 122 280" strokeWidth="0.8" strokeOpacity="0.5" />
          <path d="M 138 305 C 122 288, 106 286, 90 298" strokeWidth="0.7" strokeOpacity="0.45" />
          <path d="M 160 310 C 146 328, 130 334, 112 332" strokeWidth="0.7" strokeOpacity="0.45" />

          {/* L4 Secondary Veins */}
          <path d="M 182 225 C 168 202, 150 198, 130 208" strokeWidth="0.8" strokeOpacity="0.5" />
          <path d="M 144 230 C 128 214, 115 212, 102 222" strokeWidth="0.7" strokeOpacity="0.45" />
          <path d="M 166 235 C 154 248, 140 254, 125 252" strokeWidth="0.7" strokeOpacity="0.45" />

          {/* L5 Secondary Veins */}
          <path d="M 185 160 C 170 140, 155 138, 140 146" strokeWidth="0.7" strokeOpacity="0.45" />
          <path d="M 152 165 C 138 150, 126 150, 118 160" strokeWidth="0.6" strokeOpacity="0.4" />

          {/* Secondary Veinlets & Reticulated Capillary Filigree — Right Side */}
          {/* R1 Secondary Veins */}
          <path d="M 275 440 C 290 418, 305 415, 322 422" strokeWidth="0.8" strokeOpacity="0.5" />
          <path d="M 310 452 C 324 435, 338 434, 350 442" strokeWidth="0.7" strokeOpacity="0.45" />
          <path d="M 268 444 C 278 460, 290 468, 308 466" strokeWidth="0.7" strokeOpacity="0.45" />

          {/* R2 Secondary Veins */}
          <path d="M 272 362 C 290 338, 310 335, 332 344" strokeWidth="0.8" strokeOpacity="0.5" />
          <path d="M 318 370 C 335 352, 352 352, 368 364" strokeWidth="0.7" strokeOpacity="0.45" />
          <path d="M 285 372 C 298 390, 314 398, 334 395" strokeWidth="0.7" strokeOpacity="0.45" />

          {/* R3 Secondary Veins */}
          <path d="M 278 288 C 295 264, 315 262, 336 272" strokeWidth="0.8" strokeOpacity="0.5" />
          <path d="M 322 296 C 340 278, 356 278, 370 290" strokeWidth="0.7" strokeOpacity="0.45" />
          <path d="M 292 298 C 306 316, 322 322, 340 320" strokeWidth="0.7" strokeOpacity="0.45" />

          {/* R4 Secondary Veins */}
          <path d="M 275 218 C 290 196, 308 194, 328 204" strokeWidth="0.8" strokeOpacity="0.5" />
          <path d="M 312 222 C 328 206, 342 206, 355 216" strokeWidth="0.7" strokeOpacity="0.45" />
          <path d="M 288 226 C 300 240, 315 246, 330 244" strokeWidth="0.7" strokeOpacity="0.45" />

          {/* R5 Secondary Veins */}
          <path d="M 270 154 C 285 135, 300 134, 315 142" strokeWidth="0.7" strokeOpacity="0.45" />
          <path d="M 300 158 C 314 144, 326 145, 335 155" strokeWidth="0.6" strokeOpacity="0.4" />

          {/* Fine Botanical Capillary Micro-Details (Hand-drawn stippling / dry leaf texture) */}
          <path d="M 215 350 C 205 340, 195 344, 185 340" strokeWidth="0.5" strokeOpacity="0.35" />
          <path d="M 245 342 C 255 332, 265 336, 275 332" strokeWidth="0.5" strokeOpacity="0.35" />
          <path d="M 212 280 C 202 270, 192 274, 182 270" strokeWidth="0.5" strokeOpacity="0.35" />
          <path d="M 246 272 C 256 262, 268 266, 278 262" strokeWidth="0.5" strokeOpacity="0.35" />
          <path d="M 214 210 C 204 200, 194 204, 186 200" strokeWidth="0.5" strokeOpacity="0.35" />
          <path d="M 244 202 C 254 192, 264 196, 274 192" strokeWidth="0.5" strokeOpacity="0.35" />

          {/* Dried curled edge hint near petiole base */}
          <path
            d="M 226 535 C 220 546, 212 558, 204 564"
            strokeWidth="0.8"
            strokeOpacity="0.3"
          />
          <path
            d="M 234 532 C 242 544, 252 554, 260 560"
            strokeWidth="0.8"
            strokeOpacity="0.3"
          />
        </g>
      </svg>
    </div>
  );
}
