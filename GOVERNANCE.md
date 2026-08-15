# Governance

How decisions get made here, and who makes them.

## Who decides

AIFOXX is maintained by Karan Rajeshbhai Mungara and Aanjaneya Singh Dhoni. They hold final say on what is listed, what the code does, and what ships.

This is not a foundation and there is no committee. Saying so plainly is more useful than implying a process that does not exist.

## How listing decisions work

The scope, and the categories that are out of it, are written down in [what we list](README.md#what-we-list). Decisions follow what is written there. When a submission is declined, the reason references that section rather than a private judgement call.

Every entry is opened in a browser and checked against the live site before it is published. What the site actually does beats what a submission claims it does.

Three rules govern the data:

1. **A positive claim needs a source.** Any compliance flag set to `true` carries a link to the page on the vendor's own domain that supports it.
2. **Unknown is recorded as unknown.** Facts that cannot be verified stay `null`. They are never guessed, and never filled in to make an entry look complete.
3. **Absence of proof is not proof of absence.** "Not confirmed" means it could not be verified publicly, not that the vendor lacks it. The site says this wherever the distinction matters.

## Listings are not permanent

An entry is a judgement at a point in time. Tools are removed when they shut down, when their claims stop checking out, or when they no longer fit the scope. Tools declined before can be listed later if what they offer changes.

Owners can have their own product removed on request, without giving a reason. See [SUPPORT.md](SUPPORT.md).

## Conflicts of interest

The maintainers build their own products, and some are listed here. Two rules apply:

- **It is disclosed where it appears.** The featured section on the home page says the products in it are built by the maintainers. It is a disclosure, not a ranking.
- **They get no special treatment in the data.** Same fields, same verification, same unproven claims left as `null`, same position in the catalog as anything else.

Where a maintainer product competes with a tool that would otherwise be listed, that is worth stating rather than hiding. A competitor being absent should never be something a reader has to guess about.

## Changing the rules

The scope, these rules, and the data standards change through a pull request, so the discussion and the reasoning stay in the history. There is no separate private process.

## Code decisions

Every change goes through a pull request, including the maintainers' own. The full check gate (types, lint, tests, data validation, build) has to pass, and `main` is protected so it cannot be bypassed by pushing directly.

## Licence

Code and data are [MIT](LICENSE). Fork it, run your own, disagree with these decisions in public. That option existing is what keeps the rules above honest.
