-- Schema Supabase para App Motoristas

-- Tabela de Jornadas
CREATE TABLE public.journeys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    distance_km DECIMAL(10,3) DEFAULT 0,
    duration_minutes INTEGER DEFAULT 0,
    status TEXT CHECK (status IN ('active', 'finished')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Localizações
CREATE TABLE public.journey_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    journey_id UUID REFERENCES public.journeys(id) ON DELETE CASCADE,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Lançamentos (Ganhos e Despesas)
CREATE TABLE public.entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    journey_id UUID REFERENCES public.journeys(id) ON DELETE SET NULL,
    type TEXT CHECK (type IN ('gain', 'expense')) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    rides_count INTEGER DEFAULT NULL,
    km_total DECIMAL(10,2) DEFAULT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Metas Diárias, Semanais e Mensais
CREATE TABLE public.goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    daily_goal DECIMAL(10,2) NOT NULL,
    weekly_goal DECIMAL(10,2),
    monthly_goal DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE public.journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança
CREATE POLICY "Users can manage their own journeys" 
ON public.journeys FOR ALL USING (auth.uid() = user_id);

-- Para localizações, o usuário só acessa as que pertencem às suas jornadas
CREATE POLICY "Users can manage their own journey locations" 
ON public.journey_locations FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.journeys 
    WHERE public.journeys.id = public.journey_locations.journey_id 
    AND public.journeys.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their own entries" 
ON public.entries FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own goals" 
ON public.goals FOR ALL USING (auth.uid() = user_id);
