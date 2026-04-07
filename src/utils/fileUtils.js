import Papa from 'papaparse';

export const parseFile = async (file) => {
  return new Promise((resolve, reject) => {
    const extension = file.name.split('.').pop().toLowerCase();
    
    if (extension === 'json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target.result);
          const validated = validateQuestions(json);
          resolve(validated);
        } catch (err) {
          reject(err.message || 'Invalid JSON format');
          console.error(err);
        }
      };
      reader.readAsText(file);
    } else if (extension === 'csv') {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          try {
            const transformed = results.data.map(rawRow => {
              // Normalize keys to lowercase and remove spaces
              const row = {};
              Object.keys(rawRow).forEach(key => {
                row[key.toLowerCase().replace(/\s/g, '')] = rawRow[key];
              });

              return {
                question: (row.question || row.q)?.trim(),
                options: [
                  (row.option1 || row.a)?.trim(),
                  (row.option2 || row.b)?.trim(),
                  (row.option3 || row.c)?.trim(),
                  (row.option4 || row.d)?.trim()
                ].filter(Boolean),
                answer: (row.answer || row.correctanswer || row.correct)?.trim()
              };
            }).filter(q => q.question && q.options.length === 4 && q.answer);
            
            if (transformed.length === 0) {
              throw new Error('No valid questions found. Check your CSV headers (question, option1, option2, option3, option4, answer).');
            }

            const validated = validateQuestions(transformed);
            resolve(validated);
          } catch (err) {
            reject(err.message || 'Error processing CSV data');
            console.error(err);
          }
        },
        error: (err) => reject(err.message)
      });
    } else {
      reject('Unsupported file type. Please upload .json or .csv');
    }
  });
};

const validateQuestions = (questions) => {
  if (!Array.isArray(questions)) throw new Error('Input must be an array of questions');
  
  return questions.map((q, idx) => {
    if (!q.question) throw new Error(`Question ${idx + 1} is missing text`);
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      throw new Error(`Question ${idx + 1} must have exactly 4 options`);
    }
    if (!q.answer) throw new Error(`Question ${idx + 1} is missing the correct answer`);
    if (!q.options.includes(q.answer)) {
      throw new Error(`In Question ${idx + 1}, the answer "${q.answer}" is not one of the options`);
    }
    return {
      ...q,
      id: `${Date.now()}-${idx}`
    };
  });
};
