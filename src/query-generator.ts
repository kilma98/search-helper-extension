export type SearchMode = "general" | "academic" | "technical";

export interface QuerySuggestion {
  label: string;
  query: string;
  explanation: string;
}

export function generateQueries(
  rawQuery: string,
  mode: SearchMode
): QuerySuggestion[] {
  const query = rawQuery.trim();

  if (!query) {
    return [];
  }

  const exact = `"${query}"`;

  const byMode: Record<SearchMode, QuerySuggestion[]> = {
    general: [
      {
        label: "Exact phrase",
        query: exact,
        explanation: "Searches for the exact phrase."
      },
      {
        label: "Title focus",
        query: `intitle:${query}`,
        explanation: "Prioritizes pages with your terms in the title."
      },
      {
        label: "Less commercial noise",
        query: `${query} -shop -buy -price`,
        explanation: "Filters out many shopping-oriented results."
      },
      {
        label: "PDF sources",
        query: `${exact} filetype:pdf`,
        explanation: "Finds downloadable documents and reports."
      },
      {
        label: "Site overview",
        query: `${query} site:.org`,
        explanation: "Focuses on organizations and institutions."
      }
    ],
    academic: [
      {
        label: "PDF papers",
        query: `${exact} filetype:pdf`,
        explanation: "Finds PDF studies, papers, and reports."
      },
      {
        label: "University sources",
        query: `${query} site:.edu`,
        explanation: "Limits results to university domains."
      },
      {
        label: "Nonprofit sources",
        query: `${query} site:.org`,
        explanation: "Finds research from organizations and NGOs."
      },
      {
        label: "Report pages",
        query: `${query} intitle:report`,
        explanation: "Looks for report-style pages."
      },
      {
        label: "Study results",
        query: `${query} study OR research OR publication`,
        explanation: "Adds academic-style research terms."
      }
    ],
    technical: [
      {
        label: "GitHub results",
        query: `${query} site:github.com`,
        explanation: "Finds repositories and code discussions."
      },
      {
        label: "Stack Overflow",
        query: `${query} site:stackoverflow.com`,
        explanation: "Finds implementation discussions and fixes."
      },
      {
        label: "Documentation pages",
        query: `${query} inurl:docs`,
        explanation: "Looks for documentation URLs."
      },
      {
        label: "README / guides",
        query: `${query} readme OR guide OR tutorial`,
        explanation: "Finds setup guides and walkthroughs."
      },
      {
        label: "Official docs focus",
        query: `${exact} documentation`,
        explanation: "Pushes results toward documentation pages."
      }
    ]
  };

  return byMode[mode];
}