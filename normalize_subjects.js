import db from "./model/db.js";

// Lista canônica de matérias com acentuação padrão
const STANDARD_SUBJECTS = [
    'Matemática',
    'Português',
    'História',
    'Geografia',
    'Ciências',
    'Inglês',
    'Física',
    'Química',
    'Biologia',
    'Educação Física'
];

// Normaliza um subject para a forma padrão
function normalizeSubject(subject) {
    if (!subject) return '';
    
    const trimmed = subject.trim();
    
    // Procura uma correspondência case-insensitive na lista padrão
    const standardForm = STANDARD_SUBJECTS.find(
        std => std.toLowerCase() === trimmed.toLowerCase()
    );
    
    // Retorna a forma padrão se encontrar, senão retorna com trim
    return standardForm || trimmed;
}

async function normalizeAllSubjects() {
    try {
        console.log('🔄 Iniciando normalização de matérias no banco de dados...\n');
        
        // Busca todos os subjects únicos
        const result = await db.query(
            `SELECT DISTINCT subject FROM quizzes WHERE subject IS NOT NULL ORDER BY subject`
        );
        
        const subjects = result.rows.map(row => row.subject);
        console.log(`📚 Encontrados ${subjects.length} subjects únicos no banco:\n`);
        subjects.forEach((subject, i) => {
            console.log(`   ${i + 1}. "${subject}"`);
        });
        
        console.log('\n🔧 Normalizando...\n');
        
        let updateCount = 0;
        
        for (const subject of subjects) {
            const normalized = normalizeSubject(subject);
            
            if (subject !== normalized) {
                console.log(`   ❌ "${subject}" → ✅ "${normalized}"`);
                
                // Atualiza no banco de dados
                await db.query(
                    `UPDATE quizzes SET subject = $1 WHERE subject = $2`,
                    [normalized, subject]
                );
                updateCount++;
            } else {
                console.log(`   ✅ "${subject}" (já está correto)`);
            }
        }
        
        console.log(`\n✨ Normalização concluída! ${updateCount} subject(s) atualizado(s).\n`);
        
    } catch (error) {
        console.error('❌ Erro ao normalizar subjects:', error);
        process.exit(1);
    } finally {
        await db.end();
        process.exit(0);
    }
}

normalizeAllSubjects();
