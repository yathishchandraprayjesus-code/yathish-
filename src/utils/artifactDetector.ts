import { ArtifactData, WidgetData, ChartData } from '../types';

/**
 * Detects code artifacts, charts, or specialized interactive widgets in assistant responses.
 */
export function extractArtifact(text: string): {
  artifact?: ArtifactData;
  widget?: WidgetData;
  cleanedText: string;
} {
  // 1. Check for explicit antWidget tags
  const antWidgetMatch = text.match(/<antWidget\s+type="([^"]+)"(?:\s+title="([^"]+)")?[^>]*>([\s\S]*?)<\/antWidget>/i);
  if (antWidgetMatch) {
    const rawType = (antWidgetMatch[1] || '').toLowerCase();
    const rawContent = antWidgetMatch[3].trim();
    try {
      const parsedData = JSON.parse(rawContent);
      return {
        widget: {
          type: rawType as any,
          data: parsedData,
        },
        cleanedText: text,
      };
    } catch {
      // If not JSON, proceed to standard parsing
    }
  }

  // 2. Check for explicit antArtifact tags
  const antArtifactMatch = text.match(
    /<antArtifact\s+identifier="([^"]+)"\s+type="([^"]+)"(?:\s+title="([^"]+)")?[^>]*>([\s\S]*?)<\/antArtifact>/i
  );
  if (antArtifactMatch) {
    const id = antArtifactMatch[1] || 'art-' + Date.now();
    const rawType = antArtifactMatch[2] || '';
    const title = antArtifactMatch[3] || 'Interactive Artifact';
    const content = antArtifactMatch[4].trim();

    let type: ArtifactData['type'] = 'code';
    if (rawType.includes('react') || content.includes('import React') || content.includes('export default')) {
      type = 'react';
    } else if (rawType.includes('html') || content.includes('<!DOCTYPE html>') || content.includes('<html')) {
      type = 'html';
    } else if (rawType.includes('svg') || content.startsWith('<svg')) {
      type = 'svg';
    } else if (rawType.includes('markdown')) {
      type = 'markdown';
    }

    return {
      artifact: {
        id,
        title,
        type,
        language: type === 'react' ? 'typescript' : type === 'html' ? 'html' : 'code',
        content,
      },
      cleanedText: text,
    };
  }

  // 3. Check for SVG inline graphic
  const svgMatch = text.match(/<svg[\s\S]*?<\/svg>/i);
  if (svgMatch) {
    return {
      artifact: {
        id: 'svg-' + Date.now(),
        title: 'SVG Graphic / Diagram',
        type: 'svg',
        content: svgMatch[0],
      },
      cleanedText: text,
    };
  }

  // 4. Check for code blocks with >= 10 lines of React, HTML, TypeScript, Python, etc.
  const codeBlockRegex = /```(jsx|tsx|html|react|javascript|typescript|python|svg|css)?\n([\s\S]*?)```/i;
  const match = text.match(codeBlockRegex);

  if (match) {
    const rawLang = (match[1] || '').toLowerCase();
    const code = match[2];
    const lines = code.trim().split('\n');

    let type: ArtifactData['type'] = 'code';
    let title = 'Code Artifact';

    if (rawLang === 'html' || code.includes('<!DOCTYPE html>') || (code.includes('<html') && code.includes('</html>'))) {
      type = 'html';
      title = 'HTML Webpage Artifact';
    } else if (
      rawLang === 'jsx' ||
      rawLang === 'tsx' ||
      rawLang === 'react' ||
      code.includes('import React') ||
      code.includes('export default function') ||
      code.includes('useState') ||
      code.includes('return (')
    ) {
      type = 'react';
      title = extractComponentTitle(code) || 'React Component Artifact';
    } else if (rawLang === 'svg' || code.trim().startsWith('<svg')) {
      type = 'svg';
      title = 'Vector SVG Graphic';
    } else if (rawLang === 'markdown' || rawLang === 'md') {
      type = 'markdown';
      title = 'Structured Document (.md)';
    } else {
      type = 'code';
      title = (rawLang ? rawLang.toUpperCase() + ' ' : '') + 'Script Artifact';
    }

    if (lines.length >= 10 || code.length > 200) {
      return {
        artifact: {
          id: 'art-' + Date.now(),
          title,
          type,
          language: rawLang || 'typescript',
          content: code,
        },
        cleanedText: text,
      };
    }
  }

  // 5. Check for Quantitative Chart Data (Markdown Tables or time-series data)
  const chartData = parseChartData(text);
  if (chartData) {
    return {
      widget: {
        type: 'chart',
        data: chartData,
      },
      cleanedText: text,
    };
  }

  // 6. Check for Quiz / Knowledge Check format
  const quizData = parseQuizData(text);
  if (quizData && quizData.questions.length >= 1) {
    return {
      widget: {
        type: 'quiz',
        data: quizData,
      },
      cleanedText: text,
    };
  }

  // 7. Check for Comparison Table format
  const comparisonData = parseComparisonData(text);
  if (comparisonData && comparisonData.products.length >= 2) {
    return {
      widget: {
        type: 'comparison',
        data: comparisonData,
      },
      cleanedText: text,
    };
  }

  // 8. Check for Step-by-Step Procedure format
  const stepData = parseStepData(text);
  if (stepData && stepData.steps.length >= 3) {
    return {
      widget: {
        type: 'steps',
        data: stepData,
      },
      cleanedText: text,
    };
  }

  // 9. Check for Translation format
  const translationData = parseTranslationData(text);
  if (translationData) {
    return {
      widget: {
        type: 'translation',
        data: translationData,
      },
      cleanedText: text,
    };
  }

  // 10. Check for Recipe format
  if (
    (text.includes('Ingredients:') || text.includes('## Ingredients')) &&
    (text.includes('Instructions:') || text.includes('## Steps') || text.includes('Directions:'))
  ) {
    const recipeData = parseRecipeText(text);
    if (recipeData) {
      return {
        widget: {
          type: 'recipe',
          data: recipeData,
        },
        cleanedText: text,
      };
    }
  }

  return { cleanedText: text };
}

function extractComponentTitle(code: string): string | null {
  const match = code.match(/export\s+default\s+function\s+([A-Za-z0-9_]+)/);
  if (match && match[1]) {
    return match[1].replace(/([A-Z])/g, ' $1').trim();
  }
  const constMatch = code.match(/const\s+([A-Za-z0-9_]+)\s*=\s*\(/);
  if (constMatch && constMatch[1]) {
    return constMatch[1].replace(/([A-Z])/g, ' $1').trim();
  }
  return null;
}

/**
 * Parses markdown numerical tables or timeseries into ChartData.
 */
function parseChartData(text: string): ChartData | null {
  try {
    // Check for explicit chart markdown code block: ```chart ... ```
    const chartBlockMatch = text.match(/```(?:chart|json:chart)\n([\s\S]*?)```/i);
    if (chartBlockMatch) {
      const parsed = JSON.parse(chartBlockMatch[1]);
      if (parsed.labels && parsed.datasets) {
        return parsed as ChartData;
      }
    }

    // Check for markdown table with numbers
    const lines = text.split('\n');
    const tableLines = lines.filter((l) => l.trim().startsWith('|') && l.trim().endsWith('|'));
    if (tableLines.length < 3) return null;

    // Parse header
    const headerCols = tableLines[0]
      .split('|')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    // Skip separator line (e.g. |---|---|)
    const dataRows = tableLines.slice(2).map((r) =>
      r
        .split('|')
        .map((c) => c.trim())
        .filter((c) => c.length > 0)
    );

    if (headerCols.length < 2 || dataRows.length < 3) return null;

    // Check if second column and beyond are predominantly numeric
    const labels: string[] = [];
    const seriesValues: number[][] = headerCols.slice(1).map(() => []);

    let validNumericCount = 0;

    for (const row of dataRows) {
      if (row.length < headerCols.length) continue;
      labels.push(row[0]);
      for (let c = 1; c < headerCols.length; c++) {
        const cleanedVal = row[c].replace(/[$,%]/g, '').trim();
        const num = parseFloat(cleanedVal);
        if (!isNaN(num)) {
          seriesValues[c - 1].push(num);
          validNumericCount++;
        } else {
          seriesValues[c - 1].push(0);
        }
      }
    }

    if (validNumericCount >= dataRows.length) {
      const datasets = headerCols.slice(1).map((name, idx) => ({
        name,
        data: seriesValues[idx],
      }));

      // Infer chart type
      const titleMatch = text.match(/#+\s*(.+Chart.*|.+Growth.*|.+Metrics.*|.+Performance.*|.+Distribution.*)/i);
      const isDepth = text.toLowerCase().includes('depth') || text.toLowerCase().includes('order book');

      return {
        title: titleMatch ? titleMatch[1].trim() : 'Quantitative Dataset',
        chartType: isDepth ? 'depth' : labels.length > 6 ? 'line' : 'bar',
        labels,
        datasets,
      };
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Parses multiple-choice questions into QuizData.
 */
function parseQuizData(text: string): { title: string; questions: any[] } | null {
  try {
    const questionRegex = /(?:Question|\d+\.)\s*[:\s]?(.*?)\n([A-D]\).*?\n)+.*?(?:Answer|Correct)[:\s]*([A-D])/gis;
    const questions: any[] = [];
    let qMatch: RegExpExecArray | null;

    while ((qMatch = questionRegex.exec(text)) !== null) {
      const prompt = qMatch[1].trim();
      const optionsText = qMatch[2];
      const correctLetter = qMatch[3].trim().toUpperCase();

      const optionLines = optionsText.trim().split('\n');
      const options = optionLines.map((opt) => {
        const idMatch = opt.match(/^([A-D])\)\s*(.*)/i);
        return {
          id: idMatch ? idMatch[1].toUpperCase() : 'A',
          text: idMatch ? idMatch[2].trim() : opt.trim(),
        };
      });

      questions.push({
        id: 'q-' + (questions.length + 1),
        prompt,
        options,
        correct_option_id: correctLetter,
        explanation: 'Correct answer verified against conceptual framework.',
      });
    }

    if (questions.length > 0) {
      return {
        title: 'Interactive Knowledge Check',
        questions,
      };
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Parses comparison tables into ComparisonWidget data.
 */
function parseComparisonData(text: string): { summary: string; products: any[] } | null {
  try {
    if (!text.toLowerCase().includes('comparison') && !text.includes(' vs ') && !text.includes(' vs. ')) {
      return null;
    }

    const lines = text.split('\n');
    const tableLines = lines.filter((l) => l.trim().startsWith('|') && l.trim().endsWith('|'));
    if (tableLines.length < 3) return null;

    const headers = tableLines[0]
      .split('|')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    if (headers.length < 3) return null;

    const products = headers.slice(1).map((name) => ({
      name,
      attributes: [] as { label: string; value: string }[],
    }));

    const rows = tableLines.slice(2);
    for (const r of rows) {
      const cells = r
        .split('|')
        .map((c) => c.trim())
        .filter((c) => c.length > 0);
      if (cells.length < headers.length) continue;
      const label = cells[0];
      for (let pIdx = 0; pIdx < products.length; pIdx++) {
        products[pIdx].attributes.push({
          label,
          value: cells[pIdx + 1] || '—',
        });
      }
    }

    if (products[0].attributes.length >= 2) {
      return {
        summary: 'Architectural Feature & Spec Comparison',
        products,
      };
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Parses step-by-step numbered guides into StepWalkthrough data.
 */
function parseStepData(text: string): { summary: string; steps: any[] } | null {
  try {
    const stepRegex = /(?:^|\n)(?:###?\s*Step\s*\d+|Step\s*\d+|\d+\.)\s*[:\s]*([^\n]+)\n+([\s\S]*?)(?=(?:\n(?:###?\s*Step|\d+\.))|$)/gi;
    const steps: any[] = [];
    let sMatch: RegExpExecArray | null;

    while ((sMatch = stepRegex.exec(text)) !== null) {
      const title = sMatch[1].trim().replace(/^\*\*|\*\*$/g, '');
      const description = sMatch[2].trim().slice(0, 300);
      if (title && description) {
        steps.push({ title, description });
      }
    }

    if (steps.length >= 3) {
      return {
        summary: 'Step-by-Step Procedure',
        steps,
      };
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Parses translation pairs into TranslationWidget data.
 */
function parseTranslationData(text: string): any | null {
  try {
    const transMatch = text.match(/(?:Translate|Translation)\s+(?:from\s+)?([A-Za-z]+)\s+to\s+([A-Za-z]+)/i);
    if (!transMatch) return null;

    const source_language = transMatch[1];
    const target_language = transMatch[2];

    const originalMatch = text.match(/(?:Original|Source|Text):\s*["']?([^\n"']+)["']?/i);
    const resultMatch = text.match(/(?:Translation|Target|Output):\s*["']?([^\n"']+)["']?/i);

    if (originalMatch && resultMatch) {
      return {
        source_language,
        target_language,
        source_text: originalMatch[1].trim(),
        translation: resultMatch[1].trim(),
      };
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Parses culinary recipes into RecipeWidget data.
 */
function parseRecipeText(text: string) {
  try {
    const lines = text.split('\n');
    let title = 'Culinary Recipe';
    const titleMatch = text.match(/#+\s*(.+Recipe.*|.*Carbonara.*|.*Pasta.*|.*Dish.*)/i);
    if (titleMatch) {
      title = titleMatch[1].trim();
    }

    const ingredients: Array<{ id: string; name: string; amount: number; unit?: string }> = [];
    const steps: Array<{ id: string; title: string; content: string; timer_seconds?: number }> = [];

    let currentSection: 'none' | 'ingredients' | 'steps' = 'none';

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      if (/ingredients/i.test(line) && line.startsWith('#')) {
        currentSection = 'ingredients';
        continue;
      }
      if (/(instructions|steps|method|directions)/i.test(line) && line.startsWith('#')) {
        currentSection = 'steps';
        continue;
      }

      if (currentSection === 'ingredients' && (line.startsWith('-') || line.startsWith('*') || line.startsWith('•'))) {
        const itemText = line.replace(/^[-*•]\s*/, '');
        const amountMatch = itemText.match(/^([\d./]+)\s*([a-zA-Z]+)?\s+(.+)$/);
        if (amountMatch) {
          ingredients.push({
            id: 'ing-' + (ingredients.length + 1),
            amount: parseFloat(amountMatch[1]) || 1,
            unit: amountMatch[2] || '',
            name: amountMatch[3],
          });
        } else {
          ingredients.push({
            id: 'ing-' + (ingredients.length + 1),
            amount: 1,
            name: itemText,
          });
        }
      } else if (currentSection === 'steps' && (/^\d+\./.test(line) || line.startsWith('-'))) {
        const stepText = line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '');
        const timerMatch = stepText.match(/(\d+)\s*(minutes|mins|seconds|secs|hour|hours)/i);
        let seconds: number | undefined;
        if (timerMatch) {
          const val = parseInt(timerMatch[1], 10);
          if (timerMatch[2].startsWith('min')) seconds = val * 60;
          else if (timerMatch[2].startsWith('sec')) seconds = val;
          else if (timerMatch[2].startsWith('hour')) seconds = val * 3600;
        }

        steps.push({
          id: 'step-' + (steps.length + 1),
          title: `Step ${steps.length + 1}`,
          content: stepText,
          timer_seconds: seconds,
        });
      }
    }

    if (ingredients.length >= 2 && steps.length >= 2) {
      return {
        title,
        base_servings: 4,
        description: 'Authentic preparation crafted with precision.',
        ingredients,
        steps,
      };
    }
  } catch {
    return null;
  }
  return null;
}
