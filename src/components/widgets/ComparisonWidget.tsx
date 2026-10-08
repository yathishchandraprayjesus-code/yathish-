import React from 'react';
import { Columns3 } from 'lucide-react';

interface ProductAttribute {
  label: string;
  value: string;
}

interface ProductItem {
  name: string;
  price?: string;
  url?: string;
  attributes: ProductAttribute[];
}

export function ComparisonWidget({
  summary = 'Side-by-side comparison',
  products = [],
}: {
  summary?: string;
  products?: ProductItem[];
}) {
  if (products.length === 0) return null;

  const attributeLabels = products[0]?.attributes.map((a) => a.label) || [];

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xs">
      <div className="flex items-center gap-2 border-b border-stone-100 bg-stone-50/70 px-4 py-2.5">
        <Columns3 className="h-4 w-4 text-[#cc785c]" />
        <span className="text-xs font-semibold text-stone-700">{summary}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50/40">
              <th className="p-3 font-medium text-stone-400">Spec / Feature</th>
              {products.map((p, idx) => (
                <th key={idx} className="p-3 font-semibold text-stone-900 min-w-[160px]">
                  <div>{p.name}</div>
                  {p.price && <div className="text-[11px] font-mono text-[#cc785c]">{p.price}</div>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {attributeLabels.map((label, lIdx) => (
              <tr key={lIdx} className="hover:bg-stone-50/50 transition-colors">
                <td className="p-3 font-medium text-stone-600 bg-stone-50/20">{label}</td>
                {products.map((p, pIdx) => {
                  const val = p.attributes.find((a) => a.label === label)?.value || '—';
                  return (
                    <td key={pIdx} className="p-3 text-stone-800">
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
