export type SearchMode = "general" | "academic" | "technical";

export interface QuerySuggestion {
  label: string;
  query: string;
  explanation: string;
}

function normalizeQuery(rawQuery: string): string {
  return rawQuery
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^["']+|["']+$/g, "");
}

function isMultiWord(query: string): boolean {
  return query.includes(" ");
}

function quoted(query: string): string {
  return `"${query}"`;
}

export function uniqueSuggestions(
  suggestions: QuerySuggestion[]
): QuerySuggestion[] {
  const seen = new Set<string>();

  return suggestions.filter((item) => {
    const key = item.query.toLowerCase();
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function buildGeneralSuggestions(query: string): QuerySuggestion[] {
  const exact = quoted(query);
  const multiWord = isMultiWord(query);

  const suggestions: QuerySuggestion[] = [
    {
      label: "Exact phrase",
      query: exact,
      explanation: "Searches for the exact phrase."
    },
    {
      label: "PDF sources",
      query: `${exact} filetype:pdf`,
      explanation: "Finds downloadable reports and documents."
    },
    {
      label: "Organization sources",
      query: `${query} site:.org`,
      explanation: "Focuses on organizations and institutions."
    },
    {
      label: "Less commercial noise",
      query: `${query} -shop -buy -price -amazon`,
      explanation: "Reduces shopping-oriented results."
    },
    {
      label: "Overview pages",
      query: `${query} guide OR overview OR introduction`,
      explanation: "Finds broader explanatory pages."
    }
  ];

  if (multiWord) {
    suggestions.push({
      label: "Title contains phrase",
      query: `intitle:${exact}`,
      explanation: "Finds pages with the phrase in the title."
    });
  } else {
    suggestions.push({
      label: "Title focus",
      query: `intitle:${query}`,
      explanation: "Prioritizes pages with your keyword in the title."
    });
  }

  return uniqueSuggestions(suggestions);
}

function buildAcademicSuggestions(query: string): QuerySuggestion[] {
  const exact = quoted(query);

  return uniqueSuggestions([
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
      label: "Organization research",
      query: `${query} site:.org`,
      explanation: "Finds research from NGOs and institutions."
    },
    {
      label: "Study and research terms",
      query: `${exact} study OR research OR publication`,
      explanation: "Adds academic vocabulary to improve relevance."
    },
    {
      label: "Reports",
      query: `${exact} report OR white paper OR assessment`,
      explanation: "Finds report-style documents."
    },
    {
      label: "Data sources",
      query: `${exact} dataset OR statistics OR data`,
      explanation: "Pushes results toward evidence and data."
    },
    {
      label: "Title contains report",
      query: `intitle:report ${exact}`,
      explanation: "Looks for pages explicitly framed as reports."
    }
  ]);
}

function buildTechnicalSuggestions(query: string): QuerySuggestion[] {
  const exact = quoted(query);

  return uniqueSuggestions([
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
      label: "Official documentation",
      query: `${exact} documentation`,
      explanation: "Pushes results toward docs and manuals."
    },
    {
      label: "README and guides",
      query: `${query} readme OR guide OR tutorial`,
      explanation: "Finds setup guides and walkthroughs."
    },
    {
      label: "API references",
      query: `${query} api OR sdk OR reference`,
      explanation: "Finds API and developer reference pages."
    },
    {
      label: "Troubleshooting",
      query: `${query} error OR issue OR fix`,
      explanation: "Finds debugging help and common solutions."
    }
  ]);
}

export function normalizeSearchQuery(rawQuery: string): string {
  return normalizeQuery(rawQuery);
}

export function generateQueries(
  rawQuery: string,
  mode: SearchMode
): QuerySuggestion[] {
  const query = normalizeQuery(rawQuery);

  if (!query) {
    return [];
  }

  switch (mode) {
    case "general":
      return buildGeneralSuggestions(query);
    case "academic":
      return buildAcademicSuggestions(query);
    case "technical":
      return buildTechnicalSuggestions(query);
    default:
      return [];
  }
}