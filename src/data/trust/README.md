# Vendor Trust & Security Reports

One JSON file per vendor, named by slug, each rendered at
`https://aifoxx.com/trust/<slug>`. A file is the public record behind a vendor's
Trust & Security Report: its certifications, privacy and AI-training posture,
security controls, and things to watch. Every certification graded as held is
backed by a quote from the vendor's own trust, security, or privacy page.

## Shape

Each `<slug>.json` contains:

| Field | Meaning |
|---|---|
| `slug`, `vendor` | Identifier and legal entity name. |
| `product_family` | One-line description of the product and notable sub-products. |
| `last_verified` | Date the report was last checked. |
| `maturity` | `enterprise`, `growth`, `startup`, or `unknown`. |
| `has_trust_center`, `trust_center_url` | Whether the vendor publishes a trust center, and its URL. |
| `certifications[]` | `{ name, held, proof_quote, source }`. `held` is true only with a quote on the vendor's own domain. |
| `privacy` | `privacy_policy_url`, `terms_url`, `dpa`, `trains_on_customer_data`, `ai_training_note`, `data_region`. |
| `security[]` | `{ name, value, source }` security controls. |
| `products[]` | `{ name, category, data_scope, notes }` per-product data handling. |
| `compare` | `pricing_model`, `self_hostable`, `data_residency`, `trains_on_data`, `top_certs`. |
| `flags[]` | Caveats a buyer should know. |

The full type lives in `src/types/trust.ts`.

## Correcting a report

Do not edit these files in a pull request; they are maintained centrally so every
claim stays tied to a source. To fix something, open a
[Data correction issue](https://github.com/withkarann/aifoxx/issues/new?template=data-correction.yml)
with a link to the page on the vendor's own domain that shows the correct answer.
See [CONTRIBUTING.md](../../../CONTRIBUTING.md).
