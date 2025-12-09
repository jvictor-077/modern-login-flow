export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      aluno_modalidades: {
        Row: {
          aluno_id: string
          created_at: string
          id: string
          modalidade: string
          plano: string
          valor: number
        }
        Insert: {
          aluno_id: string
          created_at?: string
          id?: string
          modalidade: string
          plano: string
          valor: number
        }
        Update: {
          aluno_id?: string
          created_at?: string
          id?: string
          modalidade?: string
          plano?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "aluno_modalidades_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
        ]
      }
      alunos: {
        Row: {
          alergias: string | null
          autoriza_imagem: boolean | null
          celular: string | null
          contato_emergencia: string | null
          cpf: string | null
          created_at: string
          data_nascimento: string | null
          doencas: string | null
          email: string
          endereco: string | null
          id: string
          nome: string
          observacoes: string | null
          pin: string | null
          situacao: Database["public"]["Enums"]["situacao_aluno"]
          tipo_sanguineo: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          alergias?: string | null
          autoriza_imagem?: boolean | null
          celular?: string | null
          contato_emergencia?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          doencas?: string | null
          email: string
          endereco?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          pin?: string | null
          situacao?: Database["public"]["Enums"]["situacao_aluno"]
          tipo_sanguineo?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          alergias?: string | null
          autoriza_imagem?: boolean | null
          celular?: string | null
          contato_emergencia?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          doencas?: string | null
          email?: string
          endereco?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          pin?: string | null
          situacao?: Database["public"]["Enums"]["situacao_aluno"]
          tipo_sanguineo?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      aulas_avulsas_precos: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          modalidade: string
          valor: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          modalidade: string
          valor: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          modalidade?: string
          valor?: number
        }
        Relationships: []
      }
      aulas_recorrentes: {
        Row: {
          created_at: string
          dia_semana: number
          horario_fim: string
          horario_inicio: string
          id: string
          max_alunos: number | null
          modalidade: string
          professor: string
        }
        Insert: {
          created_at?: string
          dia_semana: number
          horario_fim: string
          horario_inicio: string
          id?: string
          max_alunos?: number | null
          modalidade: string
          professor: string
        }
        Update: {
          created_at?: string
          dia_semana?: number
          horario_fim?: string
          horario_inicio?: string
          id?: string
          max_alunos?: number | null
          modalidade?: string
          professor?: string
        }
        Relationships: []
      }
      configuracoes: {
        Row: {
          chave: string
          created_at: string
          id: string
          updated_at: string
          valor: Json
        }
        Insert: {
          chave: string
          created_at?: string
          id?: string
          updated_at?: string
          valor: Json
        }
        Update: {
          chave?: string
          created_at?: string
          id?: string
          updated_at?: string
          valor?: Json
        }
        Relationships: []
      }
      cronograma_aulas: {
        Row: {
          aluno_id: string
          created_at: string
          dia_semana: number
          horario: string
          id: string
          local: string
          modalidade: string
          periodo: Database["public"]["Enums"]["periodo_aula"]
          professor: string | null
        }
        Insert: {
          aluno_id: string
          created_at?: string
          dia_semana: number
          horario: string
          id?: string
          local?: string
          modalidade: string
          periodo: Database["public"]["Enums"]["periodo_aula"]
          professor?: string | null
        }
        Update: {
          aluno_id?: string
          created_at?: string
          dia_semana?: number
          horario?: string
          id?: string
          local?: string
          modalidade?: string
          periodo?: Database["public"]["Enums"]["periodo_aula"]
          professor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cronograma_aulas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
        ]
      }
      lanchonete_itens_preparo: {
        Row: {
          created_at: string
          estoque_minimo: number
          id: string
          is_active: boolean
          nome: string
          quantidade: number
          unidade: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          estoque_minimo?: number
          id?: string
          is_active?: boolean
          nome: string
          quantidade?: number
          unidade?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          estoque_minimo?: number
          id?: string
          is_active?: boolean
          nome?: string
          quantidade?: number
          unidade?: string
          updated_at?: string
        }
        Relationships: []
      }
      lanchonete_pedido_itens: {
        Row: {
          created_at: string
          id: string
          pedido_id: string
          preco_unitario: number
          produto_id: string
          quantidade: number
        }
        Insert: {
          created_at?: string
          id?: string
          pedido_id: string
          preco_unitario: number
          produto_id: string
          quantidade?: number
        }
        Update: {
          created_at?: string
          id?: string
          pedido_id?: string
          preco_unitario?: number
          produto_id?: string
          quantidade?: number
        }
        Relationships: [
          {
            foreignKeyName: "lanchonete_pedido_itens_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "lanchonete_pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lanchonete_pedido_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "lanchonete_produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      lanchonete_pedidos: {
        Row: {
          cliente_nome: string
          created_at: string
          id: string
          observacoes: string | null
          status: Database["public"]["Enums"]["status_pedido"]
          total: number
          updated_at: string
        }
        Insert: {
          cliente_nome: string
          created_at?: string
          id?: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["status_pedido"]
          total?: number
          updated_at?: string
        }
        Update: {
          cliente_nome?: string
          created_at?: string
          id?: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["status_pedido"]
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      lanchonete_produtos: {
        Row: {
          categoria: string | null
          created_at: string
          id: string
          is_active: boolean
          nome: string
          preco: number
          quantidade: number
          updated_at: string
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          nome: string
          preco?: number
          quantidade?: number
          updated_at?: string
        }
        Update: {
          categoria?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          nome?: string
          preco?: number
          quantidade?: number
          updated_at?: string
        }
        Relationships: []
      }
      modalidade_precos: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          is_active: boolean
          modalidade: string
          plano: string
          updated_at: string
          valor: number
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          is_active?: boolean
          modalidade: string
          plano: string
          updated_at?: string
          valor: number
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          is_active?: boolean
          modalidade?: string
          plano?: string
          updated_at?: string
          valor?: number
        }
        Relationships: []
      }
      produtos_estoque: {
        Row: {
          categoria: string
          created_at: string
          id: string
          is_active: boolean
          nome: string
          preco: number
          quantidade: number
          updated_at: string
        }
        Insert: {
          categoria: string
          created_at?: string
          id?: string
          is_active?: boolean
          nome: string
          preco?: number
          quantidade?: number
          updated_at?: string
        }
        Update: {
          categoria?: string
          created_at?: string
          id?: string
          is_active?: boolean
          nome?: string
          preco?: number
          quantidade?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          nome: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          nome: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          nome?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reservas: {
        Row: {
          aluno_id: string
          created_at: string
          data: string
          horario_fim: string
          horario_inicio: string
          id: string
          status: Database["public"]["Enums"]["status_reserva"]
          updated_at: string
        }
        Insert: {
          aluno_id: string
          created_at?: string
          data: string
          horario_fim: string
          horario_inicio: string
          id?: string
          status?: Database["public"]["Enums"]["status_reserva"]
          updated_at?: string
        }
        Update: {
          aluno_id?: string
          created_at?: string
          data?: string
          horario_fim?: string
          horario_inicio?: string
          id?: string
          status?: Database["public"]["Enums"]["status_reserva"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      register_aluno: {
        Args: {
          p_alergias?: string
          p_autoriza_imagem?: boolean
          p_celular?: string
          p_contato_emergencia?: string
          p_cpf?: string
          p_data_nascimento?: string
          p_doencas?: string
          p_email: string
          p_endereco?: string
          p_modalidades?: Json
          p_nome: string
          p_observacoes?: string
          p_tipo_sanguineo?: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "aluno" | "lanchonete"
      periodo_aula: "manha" | "tarde" | "noite"
      situacao_aluno: "em_dia" | "pendente" | "atrasado"
      status_pedido:
        | "pendente"
        | "preparando"
        | "pronto"
        | "entregue"
        | "cancelado"
      status_reserva: "pendente" | "confirmada" | "cancelada" | "concluida"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "aluno", "lanchonete"],
      periodo_aula: ["manha", "tarde", "noite"],
      situacao_aluno: ["em_dia", "pendente", "atrasado"],
      status_pedido: [
        "pendente",
        "preparando",
        "pronto",
        "entregue",
        "cancelado",
      ],
      status_reserva: ["pendente", "confirmada", "cancelada", "concluida"],
    },
  },
} as const
