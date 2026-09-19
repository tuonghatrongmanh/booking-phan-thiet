import { describe, expect, it } from "vitest";
import { DEFAULT_SITE_SETTINGS } from "./settings";
import { buildSiteGraph, collectSameAs } from "./site-jsonld";
import { analyzeSeo, LISTING_SEO_OPTIONS } from "./seo-analyzer";

const empty = { ...DEFAULT_SITE_SETTINGS };

type Node = Record<string, unknown>;
const graphOf = (s: typeof empty): Node[] => (buildSiteGraph(s)["@graph"] as Node[]);

describe("collectSameAs", () => {
  it("merges social links and extra lines, keeps only http(s) URLs, no duplicates", () => {
    const list = collectSameAs({
      ...empty,
      facebookUrl: "https://facebook.com/x",
      youtubeUrl: "https://facebook.com/x",
      sameAsExtra: "https://example.org/a\nnot a link\n  https://example.org/b  ",
    });
    expect(list).toEqual(["https://facebook.com/x", "https://example.org/a", "https://example.org/b"]);
  });
});

describe("buildSiteGraph", () => {
  it("never invents a founder: no Person unless a founder name was entered", () => {
    const types = graphOf(empty).map((n) => n["@type"]);
    expect(types).toEqual(["Organization", "WebSite"]);
    expect(graphOf(empty)[0]).not.toHaveProperty("founder");
  });

  it("links the organisation to the founder Person when filled in", () => {
    const g = graphOf({ ...empty, founderName: "Nguyen Van A", founderTitle: "Founder", facebookUrl: "https://facebook.com/a" });
    const org = g[0];
    const person = g.find((n) => n["@type"] === "Person")!;
    expect(person.name).toBe("Nguyen Van A");
    expect(org.founder).toEqual({ "@id": person["@id"] });
    expect(person.sameAs).toEqual(["https://facebook.com/a"]);
  });
});

describe("analyzeSeo listing options", () => {
  const base = { title: "Homestay Mui Ne", slug: "homestay-mui-ne", metaTitle: "", metaDescription: "", focusKeyword: "", contentHtml: "<p>Mo ta ngan</p>" };
  it("skips article-only checks for listings", () => {
    const ids = analyzeSeo(base, LISTING_SEO_OPTIONS).checks.map((c) => c.id);
    expect(ids).not.toContain("heading-structure");
    expect(ids).not.toContain("internal-link");
    expect(ids).not.toContain("image-alt");
    expect(analyzeSeo(base).checks.map((c) => c.id)).toContain("image-alt");
  });
});
