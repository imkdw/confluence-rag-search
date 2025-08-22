import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { LLMService, RAGContext } from './llm.type';

@Injectable()
export class OpenAILLMService implements LLMService {
  private readonly llm: ChatOpenAI;
  private readonly promptTemplate: ChatPromptTemplate;

  constructor() {
    this.llm = new ChatOpenAI({
      model: 'gpt-4o-mini',
      temperature: 0.1,
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.promptTemplate = ChatPromptTemplate.fromMessages([
      [
        'system',
        `당신은 Confluence 문서 검색 어시스턴트입니다. 
        사용자의 질문에 대해 제공된 문서 내용을 바탕으로 정확하고 도움이 되는 답변을 작성해주세요.

        **답변 작성 규칙:**
        1. 제공된 문서 내용만을 기반으로 답변하세요
        2. 정확하지 않거나 추측성 정보는 포함하지 마세요
        3. 답변 말미에 참고한 문서 제목을 언급해주세요
        4. 답변은 친근하고 이해하기 쉽게 작성해주세요
        5. 만약 제공된 문서로 답변할 수 없다면, 그 제목, 링크와 함께 그 사실을 명시해주세요

        **문서 내용:**
        {context}`,
      ],
      ['human', '{question}'],
    ]);
  }

  async generateAnswer(query: string, contexts: RAGContext[]): Promise<string> {
    const contextText = contexts
      .map(
        (ctx, index) =>
          `[문서 ${index + 1}] ${ctx.title}
          ${ctx.url}
          ${ctx.content}
          ---`,
      )
      .join('\n\n');

    const chain = this.promptTemplate.pipe(this.llm);

    const response = await chain.invoke({
      context: contextText,
      question: query,
    });

    return response.content as string;
  }
}
