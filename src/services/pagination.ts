/** Fetch until an empty page, including servers that cap the requested page size. */
export async function fetchAllPages<T extends { id: number }>(fetchPage: (params: { skip: number; limit: number }) => Promise<T[]>): Promise<T[]> {
  const records: T[] = [];
  const seen = new Set<number>();
  for (let skip = 0; ; ) {
    const page = await fetchPage({ skip, limit: 500 });
    if (!page.length) return records;
    if (page.some(r => seen.has(r.id))) throw new Error('Niespójne strony danych. Odśwież listę.');
    page.forEach(r => seen.add(r.id));
    records.push(...page);
    skip += page.length;
  }
}
