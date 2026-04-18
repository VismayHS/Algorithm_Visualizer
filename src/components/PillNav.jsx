import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import './PillNav.css'

const PillNav = ({
  logo,
  logoAlt = 'Logo',
  items = [],
  activeHref,
  className = '',
  ease = 'power3.easeOut',
  baseColor = '#fff',
  pillColor = '#120F17',
  hoveredPillTextColor = '#120F17',
  pillTextColor,
  onMobileMenuClick,
  initialLoadAnimation = true,
  onLogoClick,
}) => {
  const resolvedPillTextColor = pillTextColor ?? baseColor
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const circleRefs = useRef([])
  const timelineRefs = useRef([])
  const activeTweenRefs = useRef([])
  const logoImgRef = useRef(null)
  const logoTweenRef = useRef(null)
  const hamburgerRef = useRef(null)
  const mobileMenuRef = useRef(null)
  const navItemsRef = useRef(null)
  const logoRef = useRef(null)

  const cssVars = useMemo(
    () => ({
      '--base': baseColor,
      '--pill-bg': pillColor,
      '--hover-text': hoveredPillTextColor,
      '--pill-text': resolvedPillTextColor,
    }),
    [baseColor, pillColor, hoveredPillTextColor, resolvedPillTextColor],
  )

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle, index) => {
        if (!circle || !circle.parentElement) {
          return
        }

        const pill = circle.parentElement
        const rect = pill.getBoundingClientRect()
        const width = rect.width
        const height = rect.height

        if (width <= 0 || height <= 0) {
          return
        }

        const radius = ((width * width) / 4 + height * height) / (2 * height)
        const diameter = Math.ceil(2 * radius) + 2
        const delta = Math.ceil(radius - Math.sqrt(Math.max(0, radius * radius - (width * width) / 4))) + 1
        const originY = diameter - delta

        circle.style.width = `${diameter}px`
        circle.style.height = `${diameter}px`
        circle.style.bottom = `-${delta}px`

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`,
        })

        const label = pill.querySelector('.pill-label')
        const labelHover = pill.querySelector('.pill-label-hover')

        if (label) {
          gsap.set(label, { y: 0 })
        }

        if (labelHover) {
          gsap.set(labelHover, { y: height + 12, opacity: 0 })
        }

        timelineRefs.current[index]?.kill()
        activeTweenRefs.current[index]?.kill()

        const timeline = gsap.timeline({ paused: true })

        timeline.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: 'auto' }, 0)

        if (label) {
          timeline.to(label, { y: -(height + 8), duration: 2, ease, overwrite: 'auto' }, 0)
        }

        if (labelHover) {
          gsap.set(labelHover, { y: Math.ceil(height + 100), opacity: 0 })
          timeline.to(labelHover, { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' }, 0)
        }

        timelineRefs.current[index] = timeline
      })
    }

    layout()

    const onResize = () => layout()
    window.addEventListener('resize', onResize)

    if (document.fonts?.ready) {
      document.fonts.ready.then(layout).catch(() => {})
    }

    const menu = mobileMenuRef.current

    if (menu) {
      gsap.set(menu, { visibility: 'hidden', opacity: 0, scaleY: 1 })
    }

    if (initialLoadAnimation) {
      if (logoRef.current) {
        gsap.set(logoRef.current, { scale: 0 })
        gsap.to(logoRef.current, { scale: 1, duration: 0.6, ease })
      }

      if (navItemsRef.current) {
        gsap.set(navItemsRef.current, { width: 0, overflow: 'hidden' })
        gsap.to(navItemsRef.current, { width: 'auto', duration: 0.6, ease })
      }
    }

    const timelineSnapshot = [...timelineRefs.current]
    const activeTweenSnapshot = [...activeTweenRefs.current]

    return () => {
      window.removeEventListener('resize', onResize)
      timelineSnapshot.forEach((timeline) => timeline?.kill())
      activeTweenSnapshot.forEach((tween) => tween?.kill())
      logoTweenRef.current?.kill()
    }
  }, [items, ease, initialLoadAnimation])

  const handleEnter = (index) => {
    const timeline = timelineRefs.current[index]

    if (!timeline) {
      return
    }

    activeTweenRefs.current[index]?.kill()
    activeTweenRefs.current[index] = timeline.tweenTo(timeline.duration(), {
      duration: 0.3,
      ease,
      overwrite: 'auto',
    })
  }

  const handleLeave = (index) => {
    const timeline = timelineRefs.current[index]

    if (!timeline) {
      return
    }

    activeTweenRefs.current[index]?.kill()
    activeTweenRefs.current[index] = timeline.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: 'auto',
    })
  }

  const handleLogoEnter = () => {
    const logoImage = logoImgRef.current

    if (!logoImage) {
      return
    }

    logoTweenRef.current?.kill()
    gsap.set(logoImage, { rotate: 0 })
    logoTweenRef.current = gsap.to(logoImage, {
      rotate: 360,
      duration: 0.2,
      ease,
      overwrite: 'auto',
    })
  }

  const closeMobileMenu = () => {
    const menu = mobileMenuRef.current
    const hamburger = hamburgerRef.current

    if (hamburger) {
      const lines = hamburger.querySelectorAll('.hamburger-line')
      gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease })
      gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease })
    }

    if (menu) {
      gsap.to(menu, {
        opacity: 0,
        y: 10,
        scaleY: 1,
        duration: 0.2,
        ease,
        transformOrigin: 'top center',
        onComplete: () => {
          gsap.set(menu, { visibility: 'hidden' })
        },
      })
    }

    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false)
    }
  }

  const toggleMobileMenu = () => {
    const nextState = !isMobileMenuOpen
    setIsMobileMenuOpen(nextState)

    const hamburger = hamburgerRef.current
    const menu = mobileMenuRef.current

    if (hamburger) {
      const lines = hamburger.querySelectorAll('.hamburger-line')

      if (nextState) {
        gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease })
        gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease })
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease })
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease })
      }
    }

    if (menu) {
      if (nextState) {
        gsap.set(menu, { visibility: 'visible' })
        gsap.fromTo(
          menu,
          { opacity: 0, y: 10, scaleY: 1 },
          {
            opacity: 1,
            y: 0,
            scaleY: 1,
            duration: 0.3,
            ease,
            transformOrigin: 'top center',
          },
        )
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: 10,
          scaleY: 1,
          duration: 0.2,
          ease,
          transformOrigin: 'top center',
          onComplete: () => {
            gsap.set(menu, { visibility: 'hidden' })
          },
        })
      }
    }

    onMobileMenuClick?.()
  }

  const isExternalLink = (href = '') => {
    return (
      href.startsWith('http://') ||
      href.startsWith('https://') ||
      href.startsWith('//') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('#')
    )
  }

  const renderItem = (item, index, isMobile = false) => {
    const isActive = activeHref === item.href
    const key = item.href || `item-${index}`
    const classNames = isMobile
      ? `mobile-menu-link${isActive ? ' is-active' : ''}`
      : `pill${isActive ? ' is-active' : ''}`

    if (item.onClick) {
      return (
        <button
          key={key}
          type="button"
          className={classNames}
          aria-label={item.ariaLabel || item.label}
          onMouseEnter={isMobile ? undefined : () => handleEnter(index)}
          onMouseLeave={isMobile ? undefined : () => handleLeave(index)}
          onClick={() => {
            item.onClick(item)
            closeMobileMenu()
          }}
        >
          {!isMobile && (
            <span
              className="hover-circle"
              aria-hidden="true"
              ref={(element) => {
                circleRefs.current[index] = element
              }}
            />
          )}
          {!isMobile ? (
            <span className="label-stack">
              <span className="pill-label">{item.label}</span>
              <span className="pill-label-hover" aria-hidden="true">
                {item.label}
              </span>
            </span>
          ) : (
            item.label
          )}
        </button>
      )
    }

    if (isExternalLink(item.href || '')) {
      return (
        <a
          key={key}
          href={item.href}
          className={classNames}
          aria-label={item.ariaLabel || item.label}
          onMouseEnter={isMobile ? undefined : () => handleEnter(index)}
          onMouseLeave={isMobile ? undefined : () => handleLeave(index)}
          onClick={() => closeMobileMenu()}
        >
          {!isMobile && (
            <span
              className="hover-circle"
              aria-hidden="true"
              ref={(element) => {
                circleRefs.current[index] = element
              }}
            />
          )}
          {!isMobile ? (
            <span className="label-stack">
              <span className="pill-label">{item.label}</span>
              <span className="pill-label-hover" aria-hidden="true">
                {item.label}
              </span>
            </span>
          ) : (
            item.label
          )}
        </a>
      )
    }

    return (
      <a
        key={key}
        href={item.href || '#'}
        className={classNames}
        aria-label={item.ariaLabel || item.label}
        onMouseEnter={isMobile ? undefined : () => handleEnter(index)}
        onMouseLeave={isMobile ? undefined : () => handleLeave(index)}
        onClick={() => closeMobileMenu()}
      >
        {!isMobile && (
          <span
            className="hover-circle"
            aria-hidden="true"
            ref={(element) => {
              circleRefs.current[index] = element
            }}
          />
        )}
        {!isMobile ? (
          <span className="label-stack">
            <span className="pill-label">{item.label}</span>
            <span className="pill-label-hover" aria-hidden="true">
              {item.label}
            </span>
          </span>
        ) : (
          item.label
        )}
      </a>
    )
  }

  return (
    <div className={`pill-nav-container ${className}`}>
      <nav className="pill-nav" aria-label="Primary" style={cssVars}>
        <button
          type="button"
          className="pill-logo"
          aria-label="Home"
          onMouseEnter={handleLogoEnter}
          onClick={() => onLogoClick?.()}
          ref={logoRef}
        >
          {logo ? (
            <img src={logo} alt={logoAlt} ref={logoImgRef} />
          ) : (
            <span className="pill-logo-fallback" ref={logoImgRef}>
              AV
            </span>
          )}
        </button>

        <div className="pill-nav-items desktop-only" ref={navItemsRef}>
          <ul className="pill-list" role="menubar">
            {items.map((item, index) => (
              <li key={item.href || `desktop-${index}`} role="none">
                {renderItem(item, index)}
              </li>
            ))}
          </ul>
        </div>

        <button
          className="mobile-menu-button mobile-only"
          type="button"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          ref={hamburgerRef}
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
      </nav>

      <div className="mobile-menu-popover mobile-only" ref={mobileMenuRef} style={cssVars}>
        <ul className="mobile-menu-list">
          {items.map((item, index) => (
            <li key={item.href || `mobile-${index}`}>{renderItem(item, index, true)}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default PillNav
