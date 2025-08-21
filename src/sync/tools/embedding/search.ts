import { EmbeddingClient } from './embedding';
import { ChromaVectorStore } from './vector-store';

export async function search(word: string) {
  const embeddingClient = new EmbeddingClient();
  const vectorStore = await ChromaVectorStore.create(embeddingClient);

  const result = await vectorStore.searchSimilar(word);

  const pageMap = new Map<number, (typeof result)[0]>();

  result.forEach((item) => {
    const pageId = item.metadata!.pageId as number;
    const existing = pageMap.get(pageId);

    if (!existing || item.distance < existing.distance) {
      pageMap.set(pageId, item);
    }
  });

  const uniqueResults = Array.from(pageMap.values());

  uniqueResults.forEach((result, index) => {
    const metadata = result.metadata!;
    console.log(`${index + 1}) ${metadata.title}`);
    console.log(`  - 미리보기: ${metadata.contentPreview}`);
    console.log(`  - 링크: ${metadata.url}`);
    console.log(`  - 유사도: ${100 - Math.round(result.distance * 100)}%`);
    console.log('--------------------------------');
  });
}

search('출석체크 관련 문서좀 찾아줘');
