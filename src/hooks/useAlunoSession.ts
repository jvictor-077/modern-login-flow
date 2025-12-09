import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface AlunoSession {
  id: string;
  nome: string;
  email: string;
}

export function useAlunoSession() {
  const [aluno, setAluno] = useState<AlunoSession | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const sessionData = localStorage.getItem('aluno_session');
    if (sessionData) {
      try {
        setAluno(JSON.parse(sessionData));
      } catch {
        localStorage.removeItem('aluno_session');
      }
    }
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('aluno_session');
    setAluno(null);
    navigate('/');
  }, [navigate]);

  const isLoggedIn = !!aluno;

  return { aluno, loading, isLoggedIn, logout };
}