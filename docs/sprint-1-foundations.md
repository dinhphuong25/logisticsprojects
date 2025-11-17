# Sprint 1 – Foundations

## Goals
- Chuẩn hóa công cụ (lint, format, test) để có nền tảng CI/CD ổn định.
- Thiết lập chuẩn alias/module cho stores, utils.
- Viết unit test đầu tiên cho các hàm chia sẻ quan trọng.

## Workstreams
1. **Tooling**
   - ESLint + Prettier sống chung, thêm script `lint:fix`, `format`.
   - Vitest + Testing Library (jsdom) cho unit/component test.
   - Script `test`, `test:watch`, `test:coverage`, `check` (lint + test + typecheck).
2. **Architecture notes**
   - Duy trì alias `@/*` (tsconfig + vitest config).
   - Tạo `src/stores/index.ts` để export tập trung, giảm duplicate import paths.
   - Thu thập feedback để refactor sâu hơn (auth/product/warehouse stores) ở sprint kế tiếp.
3. **Quality bar**
   - Bổ sung test cho `src/lib/utils.ts` (định dạng ngày, currency, trạng thái).
   - Tạo `src/test/setup.ts` cho jest-dom & cleanup.

## Next candidates (post Sprint 1)
- Refactor `productStore` thành slice-based để lazy load.
- Chuẩn hóa API layer (`lib/api.ts`, `api-client`).
- UI theming tokens (design system) & storybook/thumbnails.

_Cập nhật: 17/11/2025_

