# Decisions

## 1. Why this approach?

I chose a scroll-driven image-sequence presentation because the supplied shoe frames already contained the strongest product fidelity. A conventional static ecommerce layout would communicate the product, but would lose the sense of form changing as the viewer moves through the page. A full real-time 3D shoe would offer more interaction, but would add modeling, shading, loading, and cross-device risks that were not justified by the supplied source material. Pre-rendered frames preserve the reference exactly while leaving implementation time for composition, navigation, responsive behavior, and accessible controls.

## 2. Time Trade-off

The main trade-off was choosing a pre-rendered sequence instead of a physically modeled real-time shoe. This gained predictable visual quality, a small dependency-free implementation, and reliable scroll mapping. It sacrificed arbitrary camera control and true 3D interaction. With a full additional week, I would test an optimized 3D asset against the same art direction and keep it only if it improved the experience on mobile as well as desktop.

## 3. AI Usage

Codex was used for repository audit assistance, animation and cache review, responsive/accessibility review, UI copy refinement, and documentation editing. I personally inspected the HTML, CSS, JavaScript, supplied frames, metadata, links, and Git configuration; changed the navigation, chapter labeling, mobile menu, touch targets, and documentation; and manually verified the validation scripts, syntax, external-link attributes, frame count, reduced-motion path, and responsive CSS rules. The implementation remains dependency-free and was reviewed against the actual source files rather than accepted from generated output without inspection.
