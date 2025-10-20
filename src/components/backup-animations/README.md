# Homepage Animation Backup

This folder contains the original homepage hero animation that was removed during the homepage reorganization.

## Saved Files:

1. **InteractiveMobileMockup.tsx** - The interactive mobile phone mockup component
   - Shows animated tutorials for: Search, Queensland page, Imams page
   - Auto-cycles through different animations
   - Includes cursor animation and click effects

## Original Hero Section Structure:

The hero section that contained this animation was located in `MosqueLocator.tsx` (lines 350-370):

```tsx
<header className="relative overflow-hidden bg-white pt-20">
  <div className="relative container mx-auto px-4 py-16 md:py-24 z-10">
    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
      {/* Left side - Text content */}
      <div className="text-left space-y-6">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-normal text-gray-900 leading-tight">
          A new, free platform created for the community to easily find mosques in Australia
        </h1>
        <p className="text-lg text-gray-600 font-light">
          findmymosque.org
        </p>
      </div>

      {/* Right side - Interactive Mobile Mockup */}
      <div className="relative">
        <InteractiveMobileMockup />
      </div>
    </div>
  </div>
</header>
```

## How to Restore:

If you want to restore the animation to the homepage:

1. Import the component: `import InteractiveMobileMockup from "@/components/backup-animations/InteractiveMobileMockup";`
2. Add the hero section JSX back to the top of the page (before the search section)
3. Update the layout as needed

## Date Removed:
October 20, 2025

## Reason:
Homepage reorganization - Moving search functionality to the top for better user experience.
