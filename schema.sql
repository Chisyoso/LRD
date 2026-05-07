Failed to run sql query: ERROR:  42703: column u.role does not exist
LINE 205:   select coalesce((select u.role from public.users u where u.id = auth.uid()), 'visitante');
                                    ^
