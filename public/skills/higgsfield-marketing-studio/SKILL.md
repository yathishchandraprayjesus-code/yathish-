---
name: higgsfield-marketing-studio
description: "Use when the user mentions Marketing Studio, DTC Ads, ad video, UGC video, the marketing_studio_video MCP model, or wants to generate one of the 9 Marketing Studio ad presets (UGC, Tutorial, Unboxing, Hyper Motion, Product Review, TV Spot, Wild Card, UGC Virtual Try On, Pro Virtual Try On). Also triggers on hook+setting picklist questions, preset-avatar / custom-avatar / text-generated-avatar handling, 4–15s ad video questions, or any reference to Higgsfield's ad-video product surface. Cross-surface workflow handoffs (GPT Image 2.0 / Soul Cinema / Nano Banana Pro / ms_image image gen → Marketing Studio video) covered in the companion cross-surface-workflow.md. Also use for Ad Multiplier (`ad_multiplier` — 'multiply my ad', many independently edited versions of one supplied 4–30s ad) and for Genjutsu one-off edits of a finished ad (swap one object / product / garment → `hf_mult_replace_object`; transfer motion → `hf_mult_motion_control`)."
user-invocable: true
metadata:
  tags: [higgsfield, marketing-studio, dtc-ads, marketing, ugc, ad, video, preset, hook, setting, avatar, cross-surface, ad-multiplier, genjutsu]
  version: 1.1.0
  updated: 2026-09-26
  parent: higgsfield
---

# Higgsfield Marketing Studio

## QUICK FACTS
- Hard duration cap: 4–15s per clip; out-of-range values get clamped; longer narrative = multi-clip sequence edited externally
- 9 presets: UGC, Tutorial, Unboxing (`ugc_unboxing`), Hyper Motion, Product Review, TV Spot, Wild Card, UGC Virtual Try On, Pro Virtual Try On
- Pro Virtual Try On slug is `virtual_try_on`, NOT `pro_virtual_try_on`
- Preset routing happens via `show_marketing_studio.mode` — `generate_video` has NO `mode` parameter at all
- Hook + setting picklists on FIVE presets only: UGC, Tutorial, Unboxing, Product Review, UGC Virtual Try On (NOT Pro Virtual Try On)
- 9 hooks (4 stunt / 5 subtle) as of 2026-05-18 — picklists drift; enumerate live for current UUIDs
- 14 settings (8 realistic / 6 unrealistic) as of 2026-05-18, passed by UUID as `setting_id`
- `avatars` array MUST contain exactly one entry; empty `avatars: []` substitutes a random face per render — always pass one
- Two-person scenes: primary in `avatars`, secondary as a reference image in `medias`
- `avatars` and `medias` are top-level siblings of `params` — NOT nested under `params`; wrong nesting rejects
- `prompt` is optional; `aspect_ratio` enum: auto/21:9/16:9/4:3/1:1/3:4/9:16; `resolution`: 480p/720p/1080p (default 720p)
- **Ad Multiplier** (`ad_multiplier`, "powered by Seedance 2.5"): many independently edited versions of ONE supplied 4–30s ad
- One object swapped in one clip is **Genjutsu** (`hf_mult_replace_object`), not Ad Multiplier
- Three avatar types: preset (~40 in library), uploaded, text-generated
- TV Spot has a default packshot beat — negate explicitly ("ABSOLUTELY NO PACKSHOT") when unwanted
