import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPageBySlug, getPublishedPageSlugs } from "@/actions/page-cms-actions";
import { normalizeBlocks } from "@/lib/page-blocks";

interface DynamicPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: DynamicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page || !page.isPublished) {
    return {
      title: "Stranica nije pronađena | Aqua Still Zlatibor",
    };
  }

  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription || "Aqua Still Zlatibor - Kvalitet i pouzdanost na jednom mestu.",
  };
}

export async function generateStaticParams() {
  try {
    return await getPublishedPageSlugs();
  } catch {
    return [];
  }
}

export default async function DynamicRenderPage({ params }: DynamicPageProps) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page || !page.isPublished) {
    notFound();
  }

  const blocks = normalizeBlocks(page.contentJson);

  return (
    <div className="bg-white min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl space-y-6">
        <h1 className="text-4xl font-black text-slate-900 border-b border-slate-100 pb-6">{page.title}</h1>
        
        <div className="space-y-6">
          {blocks.map((block) => (
            <div key={block.id} className={`${block.styles.padding || "py-4"} ${block.styles.margin || "my-0"}`} style={{ color: block.styles.color }}>
              {block.type === "heading" && (
                <h2 className="text-3xl font-black leading-tight" style={{ textAlign: block.props.align || "left" }}>
                  {block.props.content}
                </h2>
              )}
              {block.type === "text" && (
                <p className="text-base text-slate-600 leading-relaxed whitespace-pre-line" style={{ textAlign: block.props.align || "left" }}>
                  {block.props.content}
                </p>
              )}
              {block.type === "button" && (
                <div style={{ textAlign: block.props.align || "left" }}>
                  <a href={block.props.url || "#"} className="inline-block px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm rounded-2xl shadow-xl shadow-cyan-600/25 transition-all">
                    {block.props.content}
                  </a>
                </div>
              )}
              {block.type === "image" && (
                <div className="relative aspect-video bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                  <img src={block.props.content || "/placeholder-tool.svg"} alt={block.props.alt || "Banner"} className="object-cover w-full h-full" />
                </div>
              )}
              {block.type === "container" && (
                <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200">
                  <p className="text-slate-700 font-medium">{block.props.content || "Sadržaj sekcije..."}</p>
                </div>
              )}
              {block.type === "spacer" && (
                <div className="h-6" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
