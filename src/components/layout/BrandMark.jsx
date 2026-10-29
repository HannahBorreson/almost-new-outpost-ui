import { useId } from 'react'

// The two-tone coin pouch logo (same drawing as src/assets/icons/purse-icon.svg).
// Gradient and clip ids get a unique suffix so several logos can share a page.
// The viewBox is cropped so the pouch fills its box at small sizes.
const SAGE = '#86ab88'
const FOREST = '#3f5b38'

export default function BrandMark({ size = 48, className = '', title }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const left = `left-${id}`
  const right = `right-${id}`
  const body = `body-${id}`
  const rim = `rim-${id}`
  const clasp = `clasp-${id}`
  const knob1 = `knob1-${id}`
  const knob2 = `knob2-${id}`

  const parts = (
    <>
      <use href={`#${body}`} />
      <use href={`#${rim}`} />
      <use href={`#${clasp}`} />
      <use href={`#${knob1}`} />
      <use href={`#${knob2}`} />
    </>
  )

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="280 270 464 480"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <clipPath id={left}>
          <rect x="0" y="0" width="512" height="1024" />
        </clipPath>
        <clipPath id={right}>
          <rect x="512" y="0" width="512" height="1024" />
        </clipPath>
        <path
          id={body}
          d="M397 413 H627 C643 413 650 424 655 442 C666 481 688 514 708 551 C726 584 731 616 722 652 C710 705 667 738 605 739 H419 C357 739 314 705 302 652 C293 616 298 584 316 551 C336 514 358 481 369 442 C374 424 381 413 397 413 Z"
        />
        <path
          id={rim}
          d="M333 454 C337 410 353 380 402 380 H622 C671 380 687 410 691 454"
          fill="none"
          strokeWidth="29"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          id={clasp}
          d="M512 380 V353 L478 319 M512 353 L546 319"
          fill="none"
          strokeWidth="25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle id={knob1} cx="472" cy="315" r="30" />
        <circle id={knob2} cx="552" cy="315" r="30" />
      </defs>
      {/* Solid colours: the near-identical two-stop gradients used before showed as diagonal banding. */}
      <g clipPath={`url(#${left})`} fill={SAGE} stroke={SAGE}>
        {parts}
      </g>
      <g clipPath={`url(#${right})`} fill={FOREST} stroke={FOREST}>
        {parts}
      </g>
    </svg>
  )
}
