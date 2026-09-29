import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { Catalog } from "@/components/catalog";
import { parseCatalogQuery, catalogSearch, type SearchValues } from "@/lib/catalog-query";
import { canonicalizeEthnicityNames, getEthnicityTheme } from "@/lib/ethnicity-colors";
import { RichText } from "@/components/rich-text";
import { getCategoryContent } from "@/lib/category-content";
import {
  breadcrumbSchema,
  metadataForProductCategory,
} from "@/lib/seo";
import { pathMatches } from "@/lib/url";
import {
  getProductCategoryBySlug,
} from "@/lib/woocommerce";

export const revalidate = 900;

type CategoryPageProps = {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<SearchValues>;
};

const parseCategoryPath = (segments: string[]) => {
  const pageMarkerIndex = segments.lastIndexOf("page");
  const pageValue =
    pageMarkerIndex >= 0 ? Number(segments[pageMarkerIndex + 1]) : 1;
  const categorySegments =
    pageMarkerIndex >= 0 ? segments.slice(0, pageMarkerIndex) : segments;

  if (
    categorySegments.length === 0 ||
    !Number.isInteger(pageValue) ||
    pageValue < 1 ||
    (pageMarkerIndex >= 0 && pageMarkerIndex !== segments.length - 2)
  ) {
    return null;
  }

  const basePath = `/product-category/${categorySegments.join("/")}/`;
  const pathname =
    pageValue === 1 ? basePath : `${basePath}page/${pageValue}/`;

  return {
    categorySlug: categorySegments.at(-1)!,
    basePath,
    pathname,
    page: pageValue,
  };
};

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const parsed = parseCategoryPath((await params).slug);
  if (!parsed) return { robots: { index: false } };

  const category = await getProductCategoryBySlug(parsed.categorySlug);
  if (!category || !pathMatches(category.permalink, parsed.basePath)) {
    return { title: "Categoria não encontrada", robots: { index: false } };
  }

  const categoryName = canonicalizeEthnicityNames(category.name);
  const metadata = metadataForProductCategory(
    { ...category, name: categoryName },
    parsed.pathname,
  );
  return {
    ...metadata,
    ...(catalogSearch(parseCatalogQuery(await searchParams)).size ? { robots: { index: false, follow: true } } : {}),
    title:
      parsed.page > 1
        ? `${categoryName} — Página ${parsed.page}`
        : categoryName,
  };
}

export default async function ProductCategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const parsed = parseCategoryPath((await params).slug);
  if (!parsed) notFound();

  const category = await getProductCategoryBySlug(parsed.categorySlug);
  if (!category || !pathMatches(category.permalink, parsed.basePath)) {
    notFound();
  }

  const query = parseCatalogQuery(await searchParams);
  const additionalContent = parsed.page === 1
    ? await getCategoryContent(parsed.basePath, category.id)
    : "";
  const categoryName = canonicalizeEthnicityNames(category.name);
  const ethnicityTheme = parsed.basePath.startsWith("/product-category/rape/")
    ? getEthnicityTheme([{ name: category.name, slug: category.slug }])
    : undefined;
  const archiveTypeLabel = ethnicityTheme
    ? ethnicityTheme.name === "Caboclo"
      ? "Povo"
      : "Etnia"
    : "Categoria";

  const breadcrumbs = [
    { name: "Início", pathname: "/" },
    { name: categoryName, pathname: parsed.basePath },
  ];

  return (
    <div className="container content-page">
      <Breadcrumbs
        items={[
          { label: "Início", href: "/" },
          { label: categoryName },
        ]}
      />
      <header className="archive-header">
        <p className="eyebrow">{archiveTypeLabel}</p>
        <h1 style={ethnicityTheme ? { color: ethnicityTheme.accent } : undefined}>
          {categoryName}
        </h1>
        {parsed.page === 1 ? (
          <RichText
            html={category.description}
            className="category-description"
            textFilter={canonicalizeEthnicityNames}
          />
        ) : null}
      </header>
      <Catalog query={query} categoryId={category.id} page={parsed.page} basePath={parsed.basePath} />
      {additionalContent ? (
        <section className="category-editorial" aria-label={categoryName}>
          <RichText html={additionalContent} />
        </section>
      ) : null}
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
    </div>
  );
}
