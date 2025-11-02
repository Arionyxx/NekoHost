# Lighthouse Audit Guide

This document describes how to run and interpret Lighthouse audits for the application.

## Running Lighthouse Audits

### Using Chrome DevTools

1. Open Chrome DevTools (F12 or Cmd+Option+I)
2. Navigate to the "Lighthouse" tab
3. Select categories to audit:
   - ✅ Performance
   - ✅ Accessibility
   - ✅ Best Practices
   - ✅ SEO
4. Choose device type (Mobile/Desktop)
5. Click "Analyze page load"

### Using Lighthouse CLI

Install Lighthouse globally:

```bash
npm install -g lighthouse
```

Run audit on production build:

```bash
# Start production build
pnpm build
pnpm start

# In another terminal, run Lighthouse
lighthouse http://localhost:3000 --output html --output-path ./lighthouse-report.html
```

Run audit for specific pages:

```bash
lighthouse http://localhost:3000 --output html --output-path ./lighthouse-home.html
lighthouse http://localhost:3000/gallery --output html --output-path ./lighthouse-gallery.html
lighthouse http://localhost:3000/upload --output html --output-path ./lighthouse-upload.html
```

### Using Lighthouse CI

For automated testing in CI/CD:

```bash
npm install -g @lhci/cli

# Create lighthouserc.js
lhci autorun
```

## Target Scores

### Performance
- **Target**: 90+
- **Key Metrics**:
  - First Contentful Paint (FCP): < 1.8s
  - Largest Contentful Paint (LCP): < 2.5s
  - Total Blocking Time (TBT): < 200ms
  - Cumulative Layout Shift (CLS): < 0.1
  - Speed Index: < 3.4s

### Accessibility
- **Target**: 95+
- **Key Areas**:
  - Color contrast ratios (WCAG AA)
  - ARIA labels and roles
  - Keyboard navigation
  - Focus indicators
  - Alt text for images
  - Form labels

### Best Practices
- **Target**: 95+
- **Key Areas**:
  - HTTPS usage
  - No browser errors
  - Secure APIs
  - Image aspect ratios
  - No deprecated APIs

### SEO
- **Target**: 95+
- **Key Areas**:
  - Meta descriptions
  - Viewport meta tag
  - Document title
  - Crawlable links
  - Valid robots.txt
  - Structured data

## Optimizations Implemented

### Performance
- ✅ Next.js automatic code splitting
- ✅ Optimized images with next/image
- ✅ Minimal CSS with Tailwind purge
- ✅ Font optimization with next/font
- ✅ Static generation where possible

### Accessibility
- ✅ WCAG 2.1 AA color contrast
- ✅ Focus-visible states with mauve/lavender outlines
- ✅ ARIA labels on interactive elements
- ✅ Semantic HTML structure
- ✅ Keyboard navigation support
- ✅ Screen reader optimizations

### Best Practices
- ✅ Environment variable validation
- ✅ Error boundaries
- ✅ Secure authentication with Supabase
- ✅ HTTPS in production
- ✅ Content Security Policy headers

### SEO
- ✅ Comprehensive metadata
- ✅ OpenGraph tags
- ✅ Twitter Card tags
- ✅ Sitemap generation
- ✅ Robots.txt configuration
- ✅ Semantic HTML headings

## Common Issues and Fixes

### Performance Issues

**Issue**: Large bundle size
**Fix**: Use dynamic imports for heavy components

**Issue**: Images not optimized
**Fix**: Use next/image component with proper width/height

**Issue**: Slow Time to Interactive
**Fix**: Minimize JavaScript, use code splitting

### Accessibility Issues

**Issue**: Low contrast text
**Fix**: Use Catppuccin colors with sufficient contrast ratios

**Issue**: Missing ARIA labels
**Fix**: Add descriptive aria-label to buttons and links

**Issue**: Form inputs without labels
**Fix**: Use label elements or aria-label attributes

### SEO Issues

**Issue**: Missing meta descriptions
**Fix**: Add metadata to page layouts

**Issue**: Images without alt text
**Fix**: Add descriptive alt attributes to all images

## Monitoring

### Production Monitoring

Use these tools to continuously monitor performance:

- **Vercel Analytics**: Built-in Core Web Vitals tracking
- **Google Search Console**: SEO and crawling issues
- **PageSpeed Insights**: Regular performance checks
- **Sentry**: Error tracking and performance monitoring

### Automated Testing

Add Lighthouse CI to your GitHub Actions workflow:

```yaml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
```

## Resources

- [Web.dev Performance Guide](https://web.dev/performance/)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Core Web Vitals](https://web.dev/vitals/)
