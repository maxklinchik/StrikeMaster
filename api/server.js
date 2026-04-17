import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const app = express();
const PORT = process.env.PORT || 3000;

// Check required environment variables
let supabase = null;
if (!process.env.SUPABASE_SERVICE_KEY) {
  console.warn('WARNING: SUPABASE_SERVICE_KEY environment variable is not set!');
  console.warn('API endpoints requiring database will not work.');
} else {
  supabase = createClient(
    process.env.SUPABASE_URL || 'https://fxqddamrgadttkfxvjth.supabase.co',
    process.env.SUPABASE_SERVICE_KEY
  );
}

const mailTransport = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Boolean(process.env.SMTP_SECURE === 'true'),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
  : null;

async function sendEmail(to, subject, html) {
  if (!mailTransport) {
    return { success: false, error: 'Email service not configured (SMTP_* env vars missing)' };
  }
  try {
    await mailTransport.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// CORS - allow GitHub Pages and local development
app.use(cors({
  origin: [
    'https://arkokush.github.io',
    'https://maxklinchik.github.io',
    'http://localhost:8080',
    'http://localhost:3000',
    'http://127.0.0.1:5500',
    'http://localhost:5500'
  ],
  credentials: true
}));

app.use(express.json());

async function resolveCoachByIdentifier(identifier) {
  if (!identifier) return null;
  const trimmed = identifier.trim();
  if (!trimmed) return null;
  const isEmail = trimmed.includes('@');
  if (isEmail) {
    const { data } = await supabase
      .from('users')
      .select('id, email, team_code')
      .eq('email', trimmed.toLowerCase())
      .single();
    return data || null;
  }
  const { data } = await supabase
    .from('users')
    .select('id, email, team_code')
    .eq('team_code', trimmed.toUpperCase())
    .single();
  return data || null;
}

async function resolveSharedCoaches(sharedCoaches, ownerCoachId) {
  if (!Array.isArray(sharedCoaches) || sharedCoaches.length === 0) return [];
  const resolved = [];
  const seen = new Set();

  for (const entry of sharedCoaches) {
    if (!entry) continue;
    const canEdit = !!entry.canEdit;
    let coachId = entry.coachId;
    if (!coachId && entry.identifier) {
      const coach = await resolveCoachByIdentifier(entry.identifier);
      if (!coach) {
        throw new Error(`Coach not found for "${entry.identifier}"`);
      }
      coachId = coach.id;
    }
    if (!coachId || coachId === ownerCoachId) continue;
    if (seen.has(coachId)) continue;
    seen.add(coachId);
    resolved.push({ coach_id: coachId, can_edit: canEdit });
  }

  return resolved;
}

async function getOwnerCoachIds(coachId) {
  const ownerIds = new Set([coachId]);
  const { data } = await supabase
    .from('coach_access')
    .select('owner_coach_id')
    .eq('coach_id', coachId);
  (data || []).forEach(entry => ownerIds.add(entry.owner_coach_id));
  return Array.from(ownerIds);
}

async function canEditTeam(coachId, ownerCoachId) {
  if (coachId === ownerCoachId) return true;
  const { data } = await supabase
    .from('coach_access')
    .select('can_edit')
    .eq('owner_coach_id', ownerCoachId)
    .eq('coach_id', coachId)
    .single();
  return !!data?.can_edit;
}

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: supabase ? 'connected' : 'not configured'
  });
});

// ==================== AUTH ENDPOINTS ====================

// Coach Sign Up - Creates user with team code
app.post('/api/auth/signup', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { email, password, firstName, lastName, teamName, googleId, avatarUrl } = req.body;
    
    if (!email || !password || !firstName || !lastName || !teamName) {
      return res.status(400).json({ error: 'All fields required: email, password, firstName, lastName, teamName' });
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Generate unique 6-character team code
    const teamCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Create auth user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) {
      console.error('Auth error:', authError);
      throw authError;
    }

    // Create user profile in users table
    const { data: userData, error: profileError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email: email.toLowerCase(),
        first_name: firstName,
        last_name: lastName,
        team_name: teamName,
        team_code: teamCode,
        google_id: googleId || null,
        avatar_url: avatarUrl || null
      }])
      .select()
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
      // Try to clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    // Sign in to get session
    const { data: sessionData } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    res.json({
      success: true,
      user: userData,
      token: sessionData?.session?.access_token
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Coach Login
app.post('/api/auth/login', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.warn('Could not fetch profile:', profileError.message);
    }

    res.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        ...userProfile
      },
      token: data.session?.access_token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: error.message });
  }
});

// Student Sign Up with Email, Password, and Team Code
app.post('/api/auth/student-signup', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { email, password, teamCode, googleId, avatarUrl, name } = req.body;

    if (!email || !password || !teamCode) {
      return res.status(400).json({ error: 'Email, password, and team code required' });
    }

    // First, find coach by team code to get coach_id
    const { data: coach, error: coachError } = await supabase
      .from('users')
      .select('id, team_name, first_name, last_name, team_code')
      .eq('team_code', teamCode.toUpperCase())
      .single();

    if (coachError || !coach) {
      return res.status(404).json({ error: 'Invalid team code' });
    }

    // Check if student email already exists
    const { data: existingStudent } = await supabase
      .from('students')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingStudent) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create student record
    const { data: student, error: studentError } = await supabase
      .from('students')
      .insert([{
        email: email.toLowerCase(),
        password_hash: password, // In production, hash this!
        coach_id: coach.id,
        team_code: teamCode.toUpperCase(),
        google_id: googleId || null,
        avatar_url: avatarUrl || null,
        name: name || null
      }])
      .select()
      .single();

    if (studentError) {
      console.error('Student signup error:', studentError);
      return res.status(500).json({ error: 'Failed to create account' });
    }

    res.json({
      success: true,
      user: {
        id: coach.id,
        email: student.email,
        coach_id: coach.id,
        team_name: coach.team_name,
        team_code: coach.team_code,
        role: 'student'
      }
    });

  } catch (error) {
    console.error('Student signup error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Student Sign In with Email and Password
app.post('/api/auth/student-login', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find student by email
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (studentError || !student) {
      return res.status(404).json({ error: 'Invalid email or password' });
    }

    // Check password (in production, use proper password hashing)
    if (student.password_hash !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Get coach info
    const { data: coach } = await supabase
      .from('users')
      .select('id, team_name, first_name, last_name, team_code')
      .eq('id', student.coach_id)
      .single();

    res.json({
      success: true,
      user: {
        id: coach?.id || student.coach_id,
        email: student.email,
        coach_id: student.coach_id,
        team_name: coach?.team_name,
        team_code: coach?.team_code,
        role: 'student'
      }
    });

  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Google OAuth Sign In/Sign Up
app.post('/api/auth/google-login', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { email, name, googleId, avatarUrl } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({ error: 'Email and Google ID required' });
    }

    // First check if user is a coach
    const { data: coach, error: coachError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (coach && !coachError) {
      // Existing coach - update with Google info if needed
      if (!coach.google_id) {
        await supabase
          .from('users')
          .update({ google_id: googleId, avatar_url: avatarUrl })
          .eq('id', coach.id);
      }

      return res.json({
        success: true,
        user: {
          id: coach.id,
          email: coach.email,
          first_name: coach.first_name,
          last_name: coach.last_name,
          team_name: coach.team_name,
          team_code: coach.team_code,
          avatar_url: avatarUrl || coach.avatar_url
        },
        role: 'coach'
      });
    }

    // Check if user is an existing student
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (student && !studentError) {
      // Existing student - update with Google info
      if (!student.google_id) {
        await supabase
          .from('students')
          .update({ google_id: googleId, avatar_url: avatarUrl, name: name })
          .eq('id', student.id);
      }

      // Get coach info
      const { data: studentCoach } = await supabase
        .from('users')
        .select('id, team_name, team_code')
        .eq('id', student.coach_id)
        .single();

      return res.json({
        success: true,
        user: {
          id: studentCoach?.id || student.coach_id,
          email: student.email,
          name: name || student.name,
          coach_id: student.coach_id,
          team_name: studentCoach?.team_name,
          team_code: studentCoach?.team_code,
          avatar_url: avatarUrl || student.avatar_url
        },
        role: 'student'
      });
    }

    // New user - they need to complete signup (choose role, etc.)
    // Don't create any record yet - let them complete signup flow
    res.json({
      success: true,
      needsSignup: true,
      user: {
        email: email.toLowerCase(),
        name: name,
        avatar_url: avatarUrl,
        googleId: googleId
      }
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user profile
app.get('/api/auth/profile/:userId', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.params.userId)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(404).json({ error: error.message });
  }
});

// Update user profile (username/email)
app.put('/api/auth/profile/:userId', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { username, email } = req.body;
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    if (username && /\s/.test(username)) {
      return res.status(400).json({ error: 'Username cannot contain spaces' });
    }

    if (email && !email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    if (email) {
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .neq('id', userId)
        .single();
      if (existing) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    if (username) {
      const { data: existingUsername } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .neq('id', userId)
        .single();
      if (existingUsername) {
        return res.status(400).json({ error: 'Username already in use' });
      }
    }

    const updates = {};
    if (username !== undefined) updates.username = username || null;
    if (email !== undefined) updates.email = email.toLowerCase();

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    if (email) {
      const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
        email: email.toLowerCase()
      });
      if (authError) {
        throw new Error(`Auth email update failed: ${authError.message || authError}`);
      }
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Change password (requires old password)
app.post('/api/auth/change-password', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { userId, email, oldPassword, newPassword } = req.body;

    if (!userId || !email || !oldPassword || !newPassword) {
      return res.status(400).json({ error: 'userId, email, oldPassword, and newPassword are required' });
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: oldPassword
    });

    if (signInError) {
      return res.status(401).json({ error: 'Old password is incorrect' });
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    if (updateError) {
      throw new Error(`Auth password update failed: ${updateError.message || updateError}`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(400).json({ error: error.message });
  }
});

// ==================== COACH ACCESS ====================

app.get('/api/coach-access', async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not configured' });
    const { ownerCoachId } = req.query;
    if (!ownerCoachId) return res.status(400).json({ error: 'ownerCoachId is required' });

    const { data: access } = await supabase
      .from('coach_access')
      .select('coach_id, can_edit')
      .eq('owner_coach_id', ownerCoachId);

    const coachIds = (access || []).map(entry => entry.coach_id);
    const { data: coaches } = coachIds.length
      ? await supabase.from('users').select('id, email, team_code, first_name, last_name').in('id', coachIds)
      : { data: [] };

    const coachMap = new Map((coaches || []).map(c => [c.id, c]));
    const response = (access || []).map(entry => {
      const coach = coachMap.get(entry.coach_id);
      return {
        coach_id: entry.coach_id,
        can_edit: entry.can_edit,
        email: coach?.email || null,
        team_code: coach?.team_code || null,
        name: coach ? `${coach.first_name || ''} ${coach.last_name || ''}`.trim() : ''
      };
    });

    res.json(response);
  } catch (error) {
    console.error('Coach access list error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/coach-access', async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not configured' });
    const { ownerCoachId, identifier, canEdit } = req.body;
    if (!ownerCoachId || !identifier) {
      return res.status(400).json({ error: 'ownerCoachId and identifier are required' });
    }

    const coach = await resolveCoachByIdentifier(identifier);
    if (!coach) return res.status(404).json({ error: 'Coach not found' });
    if (coach.id === ownerCoachId) {
      return res.status(400).json({ error: 'Cannot invite yourself' });
    }

    const { data, error } = await supabase
      .from('coach_access')
      .upsert({
        owner_coach_id: ownerCoachId,
        coach_id: coach.id,
        can_edit: !!canEdit
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Coach access create error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/coach-access/:coachId', async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not configured' });
    const { ownerCoachId } = req.query;
    if (!ownerCoachId) return res.status(400).json({ error: 'ownerCoachId is required' });

    const { error } = await supabase
      .from('coach_access')
      .delete()
      .eq('owner_coach_id', ownerCoachId)
      .eq('coach_id', req.params.coachId);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Coach access delete error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/coach-access/owners', async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not configured' });
    const { coachId } = req.query;
    if (!coachId) return res.status(400).json({ error: 'coachId is required' });

    const { data: access } = await supabase
      .from('coach_access')
      .select('owner_coach_id, can_edit')
      .eq('coach_id', coachId);

    if (!access || access.length === 0) {
      return res.json([]);
    }

    const ownerIds = access.map(entry => entry.owner_coach_id);
    const { data: owners } = await supabase
      .from('users')
      .select('id, team_name, email, first_name, last_name')
      .in('id', ownerIds);

    const ownerMap = new Map((owners || []).map(o => [o.id, o]));
    const result = access.map(entry => {
      const owner = ownerMap.get(entry.owner_coach_id);
      return {
        owner_coach_id: entry.owner_coach_id,
        can_edit: entry.can_edit,
        team_name: owner?.team_name || null,
        email: owner?.email || null,
        name: owner ? `${owner.first_name || ''} ${owner.last_name || ''}`.trim() : ''
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Coach access owners error:', error);
    res.status(400).json({ error: error.message });
  }
});

// ==================== ANNOUNCEMENTS ====================

app.get('/api/announcements', async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not configured' });
    const { coachId } = req.query;
    if (!coachId) return res.status(400).json({ error: 'coachId is required' });

    const ownerCoachIds = await getOwnerCoachIds(coachId);
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .in('coach_id', ownerCoachIds)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Announcements fetch error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/announcements', async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Database not configured' });
    const { coachId, title, body, ownerCoachId } = req.body;
    if (!coachId || !title || !body) {
      return res.status(400).json({ error: 'coachId, title, and body are required' });
    }

    const targetCoachId = ownerCoachId || coachId;
    if (!(await canEditTeam(coachId, targetCoachId))) {
      return res.status(403).json({ error: 'Edit access denied' });
    }

    const { data, error } = await supabase
      .from('announcements')
      .insert([{ coach_id: targetCoachId, title, body }])
      .select()
      .single();

    if (error) throw error;

    const { data: players } = await supabase
      .from('players')
      .select('email')
      .eq('coach_id', targetCoachId)
      .not('email', 'is', null);

    let emailStatus = { sent: false, recipients: 0, error: null };
    if (players && players.length) {
      const emails = players.map(p => p.email).filter(Boolean);
      if (emails.length) {
        const result = await sendEmail(
          emails,
          `New Announcement: ${title}`,
          `<p>${body}</p>`
        );
        emailStatus = {
          sent: !!result.success,
          recipients: emails.length,
          error: result.success ? null : result.error
        };
      }
    }

    res.json({ ...data, emailStatus });
  } catch (error) {
    console.error('Announcement create error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Link Google Account to existing user
app.post('/api/auth/link-google', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { email, googleId, avatarUrl, role } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({ error: 'Email and Google ID required' });
    }

    if (role === 'coach') {
      // Link to coach account
      const { data: coach, error: coachError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (coachError || !coach) {
        return res.status(404).json({ error: 'Account not found' });
      }

      if (coach.google_id) {
        return res.status(400).json({ error: 'Google account already linked' });
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({ google_id: googleId, avatar_url: avatarUrl || coach.avatar_url })
        .eq('id', coach.id);

      if (updateError) {
        throw updateError;
      }

      return res.json({
        success: true,
        message: 'Google account linked successfully',
        user: { ...coach, google_id: googleId, avatar_url: avatarUrl || coach.avatar_url }
      });
    } else {
      // Link to student account
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (studentError || !student) {
        return res.status(404).json({ error: 'Account not found' });
      }

      if (student.google_id) {
        return res.status(400).json({ error: 'Google account already linked' });
      }

      const { error: updateError } = await supabase
        .from('students')
        .update({ google_id: googleId, avatar_url: avatarUrl || student.avatar_url })
        .eq('id', student.id);

      if (updateError) {
        throw updateError;
      }

      return res.json({
        success: true,
        message: 'Google account linked successfully',
        user: { ...student, google_id: googleId, avatar_url: avatarUrl || student.avatar_url }
      });
    }
  } catch (error) {
    console.error('Link Google error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Unlink Google Account from existing user
app.post('/api/auth/unlink-google', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    if (role === 'coach') {
      const { error: updateError } = await supabase
        .from('users')
        .update({ google_id: null })
        .eq('email', email.toLowerCase());

      if (updateError) throw updateError;
    } else {
      const { error: updateError } = await supabase
        .from('students')
        .update({ google_id: null })
        .eq('email', email.toLowerCase());

      if (updateError) throw updateError;
    }

    res.json({ success: true, message: 'Google account unlinked successfully' });
  } catch (error) {
    console.error('Unlink Google error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check if user has Google linked
app.get('/api/auth/google-status', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { email, role } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    let googleId = null;

    if (role === 'coach') {
      const { data: coach } = await supabase
        .from('users')
        .select('google_id')
        .eq('email', email.toLowerCase())
        .single();
      googleId = coach?.google_id;
    } else {
      const { data: student } = await supabase
        .from('students')
        .select('google_id')
        .eq('email', email.toLowerCase())
        .single();
      googleId = student?.google_id;
    }

    res.json({ linked: !!googleId });
  } catch (error) {
    console.error('Google status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== LOCATIONS ENDPOINTS ====================

// Get saved locations for a coach
app.get('/api/locations', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { coachId } = req.query;
    if (!coachId) {
      return res.status(400).json({ error: 'coachId is required' });
    }

    const { data, error } = await supabase
      .from('users')
      .select('saved_locations')
      .eq('id', coachId)
      .single();

    if (error) throw error;
    
    // Return default locations if none saved
    const defaultLocations = ['Montvale Lanes', 'Bowler City', 'Lodi Lanes', 'Parkway Lanes', 'Holiday Bowl'];
    res.json(data?.saved_locations || defaultLocations);

  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Save locations for a coach
app.put('/api/locations', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { coachId, locations } = req.body;
    if (!coachId || !locations) {
      return res.status(400).json({ error: 'coachId and locations are required' });
    }

    const { data, error } = await supabase
      .from('users')
      .update({ saved_locations: locations })
      .eq('id', coachId)
      .select()
      .single();

    if (error) throw error;
    res.json(data.saved_locations || locations);

  } catch (error) {
    console.error('Save locations error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add a single location
app.post('/api/locations', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { coachId, location } = req.body;
    if (!coachId || !location) {
      return res.status(400).json({ error: 'coachId and location are required' });
    }

    // Get current locations
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('saved_locations')
      .eq('id', coachId)
      .single();

    if (fetchError) throw fetchError;

    const defaultLocations = ['Montvale Lanes', 'Bowler City', 'Lodi Lanes', 'Parkway Lanes', 'Holiday Bowl'];
    const currentLocations = userData?.saved_locations || defaultLocations;
    
    // Add new location if not already present
    if (!currentLocations.includes(location)) {
      currentLocations.push(location);
    }

    const { data, error } = await supabase
      .from('users')
      .update({ saved_locations: currentLocations })
      .eq('id', coachId)
      .select()
      .single();

    if (error) throw error;
    res.json(data.saved_locations || currentLocations);

  } catch (error) {
    console.error('Add location error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== PLAYERS ENDPOINTS ====================

// Get all players for a coach (filtered by gender)
app.get('/api/players', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { coachId, gender } = req.query;

    if (!coachId) {
      return res.status(400).json({ error: 'coachId is required' });
    }

    const ownerCoachIds = await getOwnerCoachIds(coachId);

    let query = supabase
      .from('players')
      .select('*')
      .in('coach_id', ownerCoachIds)
      .eq('is_active', true)
      .order('last_name');

    if (gender) {
      query = query.eq('gender', gender);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);

  } catch (error) {
    console.error('Get players error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single player
app.get('/api/players/:id', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(data);

  } catch (error) {
    console.error('Get player error:', error);
    res.status(404).json({ error: error.message });
  }
});

// Create player
app.post('/api/players', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { coachId, firstName, lastName, gender, gradYear, email, ownerCoachId } = req.body;

    if (!coachId || !firstName || !lastName || !gender) {
      return res.status(400).json({ error: 'Required: coachId, firstName, lastName, gender' });
    }

    const targetCoachId = ownerCoachId || coachId;
    const allowed = await canEditTeam(coachId, targetCoachId);
    if (!allowed) {
      return res.status(403).json({ error: 'Edit access denied' });
    }

    const { data, error } = await supabase
      .from('players')
      .insert([{
        coach_id: targetCoachId,
        first_name: firstName,
        last_name: lastName,
        gender,
        email: email || null,
        grad_year: gradYear ? parseInt(gradYear) : null,
        is_active: true
      }])
      .select()
      .single();

    if (error) throw error;
    let emailStatus = { sent: false, recipients: 0, error: null };
    if (email) {
      const { data: owner } = await supabase
        .from('users')
        .select('team_code, team_name')
        .eq('id', targetCoachId)
        .single();

      const teamCode = owner?.team_code || '';
      const teamName = owner?.team_name || 'your team';
      const result = await sendEmail(
        email,
        `Welcome to ${teamName}`,
        `<p>You’ve been invited to join <strong>${teamName}</strong> on StrikeMaster.</p>
         <p>Your team code is: <strong>${teamCode}</strong></p>
         <p>Use this code to sign in as a player.</p>`
      );
      emailStatus = {
        sent: !!result.success,
        recipients: 1,
        error: result.success ? null : result.error
      };
    }
    res.json({ ...data, emailStatus });

  } catch (error) {
    console.error('Create player error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update player
app.put('/api/players/:id', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { firstName, lastName, gender, gradYear, isActive, coachId, email } = req.body;

    const updateData = {};
    if (firstName !== undefined) updateData.first_name = firstName;
    if (lastName !== undefined) updateData.last_name = lastName;
    if (gender !== undefined) updateData.gender = gender;
    if (gradYear !== undefined) updateData.grad_year = parseInt(gradYear);
    if (isActive !== undefined) updateData.is_active = isActive;

    if (coachId) {
      const { data: player } = await supabase
        .from('players')
        .select('coach_id')
        .eq('id', req.params.id)
        .single();
      if (player?.coach_id && !(await canEditTeam(coachId, player.coach_id))) {
        return res.status(403).json({ error: 'Edit access denied' });
      }
    }

    if (email !== undefined) updateData.email = email;

    const { data, error } = await supabase
      .from('players')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);

  } catch (error) {
    console.error('Update player error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete player (soft delete)
app.delete('/api/players/:id', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { data, error } = await supabase
      .from('players')
      .update({ is_active: false })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, message: 'Player removed' });

  } catch (error) {
    console.error('Delete player error:', error);
    res.status(400).json({ error: error.message });
  }
});

// ==================== MATCHES ENDPOINTS ====================

// Get all matches for a coach
app.get('/api/matches', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { coachId, gender } = req.query;

    if (!coachId) {
      return res.status(400).json({ error: 'coachId is required' });
    }

    const ownerCoachIds = await getOwnerCoachIds(coachId);
    const { data: accessList } = await supabase
      .from('coach_access')
      .select('owner_coach_id, can_edit')
      .eq('coach_id', coachId);
    const accessMap = new Map((accessList || []).map(entry => [entry.owner_coach_id, entry.can_edit]));

    let ownerQuery = supabase
      .from('matches')
      .select('*')
      .in('coach_id', ownerCoachIds);

    if (gender) {
      ownerQuery = ownerQuery.eq('gender', gender);
    }

    const { data: ownerMatches, error: ownerError } = await ownerQuery;
    if (ownerError) throw ownerError;

    const { data: permissions, error: permError } = await supabase
      .from('match_permissions')
      .select('match_id, can_edit')
      .eq('coach_id', coachId);
    if (permError) throw permError;

    const sharedMatchIds = (permissions || []).map(p => p.match_id);
    let sharedMatches = [];
    if (sharedMatchIds.length > 0) {
      let sharedQuery = supabase
        .from('matches')
        .select('*')
        .in('id', sharedMatchIds);
      if (gender) {
        sharedQuery = sharedQuery.eq('gender', gender);
      }
      const { data: sharedData, error: sharedError } = await sharedQuery;
      if (sharedError) throw sharedError;
      sharedMatches = sharedData || [];
    }

    const permissionMap = new Map((permissions || []).map(p => [p.match_id, p.can_edit]));
    const matchMap = new Map();

    (ownerMatches || []).forEach(match => {
      const isOwner = match.coach_id === coachId;
      matchMap.set(match.id, {
        ...match,
        can_edit: isOwner ? true : !!accessMap.get(match.coach_id),
        is_owner: isOwner
      });
    });

    sharedMatches.forEach(match => {
      if (!matchMap.has(match.id)) {
        matchMap.set(match.id, {
          ...match,
          can_edit: !!permissionMap.get(match.id),
          is_owner: false
        });
      }
    });

    const merged = Array.from(matchMap.values()).sort((a, b) => {
      const dateA = a.match_date ? new Date(a.match_date) : new Date(0);
      const dateB = b.match_date ? new Date(b.match_date) : new Date(0);
      return dateB - dateA;
    });

    res.json(merged);

  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single match
app.get('/api/matches/:id', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { coachId } = req.query;

    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (coachId && data.coach_id !== coachId) {
      const { data: permission } = await supabase
        .from('match_permissions')
        .select('can_edit')
        .eq('match_id', req.params.id)
        .eq('coach_id', coachId)
        .single();

      if (!permission) {
        const { data: access } = await supabase
          .from('coach_access')
          .select('can_edit')
          .eq('owner_coach_id', data.coach_id)
          .eq('coach_id', coachId)
          .single();

        if (!access) {
          return res.status(403).json({ error: 'Access denied' });
        }

        data.can_edit = !!access.can_edit;
        data.is_owner = false;
      } else {
        data.can_edit = !!permission.can_edit;
        data.is_owner = false;
      }
    } else {
      data.can_edit = true;
      data.is_owner = true;
    }

    const { data: sharedPermissions } = await supabase
      .from('match_permissions')
      .select('coach_id, can_edit')
      .eq('match_id', req.params.id);

    const sharedCoachIds = (sharedPermissions || []).map(p => p.coach_id);
    let sharedCoaches = [];
    if (sharedCoachIds.length > 0) {
      const { data: coaches } = await supabase
        .from('users')
        .select('id, email, team_code')
        .in('id', sharedCoachIds);

      const coachMap = new Map((coaches || []).map(c => [c.id, c]));
      sharedCoaches = (sharedPermissions || []).map(entry => {
        const coach = coachMap.get(entry.coach_id);
        return {
          coach_id: entry.coach_id,
          can_edit: entry.can_edit,
          email: coach?.email || null,
          team_code: coach?.team_code || null
        };
      });
    }

    data.shared_coaches = sharedCoaches;
    res.json(data);

  } catch (error) {
    console.error('Get match error:', error);
    res.status(404).json({ error: error.message });
  }
});

// Create match
app.post('/api/matches', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { coachId, gender, matchType, opponent, matchDate, location, result, ourScore, opponentScore, comments, teamG1, teamG2, teamG3, teamG4, oppG1, oppG2, oppG3, oppG4, sharedCoaches } = req.body;

    if (!coachId || !gender || !opponent || !matchDate) {
      return res.status(400).json({ error: 'Required: coachId, gender, opponent, matchDate' });
    }

    const resolvedShared = await resolveSharedCoaches(sharedCoaches, coachId);

    const { data, error } = await supabase
      .from('matches')
      .insert([{
        coach_id: coachId,
        gender,
        match_type: matchType || 'team',
        opponent,
        match_date: matchDate,
        location: location || null,
        result: result || null,
        our_score: ourScore ? parseInt(ourScore) : 0,
        opponent_score: opponentScore ? parseInt(opponentScore) : 0,
        comments: comments || null,
        team_g1: teamG1 ? parseInt(teamG1) : null,
        team_g2: teamG2 ? parseInt(teamG2) : null,
        team_g3: teamG3 ? parseInt(teamG3) : null,
        team_g4: teamG4 ? parseInt(teamG4) : null,
        opp_g1: oppG1 ? parseInt(oppG1) : null,
        opp_g2: oppG2 ? parseInt(oppG2) : null,
        opp_g3: oppG3 ? parseInt(oppG3) : null,
        opp_g4: oppG4 ? parseInt(oppG4) : null,
        is_complete: false
      }])
      .select()
      .single();

    if (error) throw error;

    if (resolvedShared.length > 0) {
      const sharePayload = resolvedShared.map(entry => ({
        match_id: data.id,
        coach_id: entry.coach_id,
        can_edit: entry.can_edit
      }));

      const { error: shareError } = await supabase
        .from('match_permissions')
        .insert(sharePayload);

      if (shareError) throw shareError;
    }

    res.json(data);

  } catch (error) {
    console.error('Create match error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update match (scores, result)
app.put('/api/matches/:id', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { coachId, opponent, matchDate, location, ourScore, opponentScore, result, isComplete, comments, teamG1, teamG2, teamG3, teamG4, oppG1, oppG2, oppG3, oppG4, matchType, sharedCoaches } = req.body;

    if (coachId) {
      const { data: matchOwner, error: ownerError } = await supabase
        .from('matches')
        .select('coach_id')
        .eq('id', req.params.id)
        .single();

      if (ownerError || !matchOwner) {
        return res.status(404).json({ error: 'Match not found' });
      }

      if (matchOwner.coach_id !== coachId) {
        const { data: permission } = await supabase
          .from('match_permissions')
          .select('can_edit')
          .eq('match_id', req.params.id)
          .eq('coach_id', coachId)
          .single();

        if (!permission || !permission.can_edit) {
          return res.status(403).json({ error: 'Edit access denied' });
        }
      }
    }

    const updateData = {};
    if (opponent !== undefined) updateData.opponent = opponent;
    if (matchDate !== undefined) updateData.match_date = matchDate;
    if (location !== undefined) updateData.location = location;
    if (ourScore !== undefined) updateData.our_score = parseInt(ourScore);
    if (opponentScore !== undefined) updateData.opponent_score = parseInt(opponentScore);
    if (result !== undefined) updateData.result = result;
    if (isComplete !== undefined) updateData.is_complete = isComplete;
    if (comments !== undefined) updateData.comments = comments;
    if (matchType !== undefined) updateData.match_type = matchType;
    if (teamG1 !== undefined) updateData.team_g1 = teamG1 ? parseInt(teamG1) : null;
    if (teamG2 !== undefined) updateData.team_g2 = teamG2 ? parseInt(teamG2) : null;
    if (teamG3 !== undefined) updateData.team_g3 = teamG3 ? parseInt(teamG3) : null;
    if (teamG4 !== undefined) updateData.team_g4 = teamG4 ? parseInt(teamG4) : null;
    if (oppG1 !== undefined) updateData.opp_g1 = oppG1 ? parseInt(oppG1) : null;
    if (oppG2 !== undefined) updateData.opp_g2 = oppG2 ? parseInt(oppG2) : null;
    if (oppG3 !== undefined) updateData.opp_g3 = oppG3 ? parseInt(oppG3) : null;
    if (oppG4 !== undefined) updateData.opp_g4 = oppG4 ? parseInt(oppG4) : null;

    const resolvedShared = await resolveSharedCoaches(sharedCoaches, coachId);

    const { data, error } = await supabase
      .from('matches')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    if (Array.isArray(sharedCoaches)) {
      await supabase
        .from('match_permissions')
        .delete()
        .eq('match_id', req.params.id);

      if (resolvedShared.length > 0) {
        const sharePayload = resolvedShared.map(entry => ({
          match_id: req.params.id,
          coach_id: entry.coach_id,
          can_edit: entry.can_edit
        }));

        const { error: shareError } = await supabase
          .from('match_permissions')
          .insert(sharePayload);

        if (shareError) throw shareError;
      }
    }

    res.json(data);

  } catch (error) {
    console.error('Update match error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete match
app.delete('/api/matches/:id', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true, message: 'Match deleted' });

  } catch (error) {
    console.error('Delete match error:', error);
    res.status(400).json({ error: error.message });
  }
});

// ==================== RECORDS ENDPOINTS ====================

// Get all records for a match
app.get('/api/matches/:matchId/records', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { data, error } = await supabase
      .from('records')
      .select(`
        *,
        player:players(id, first_name, last_name, gender)
      `)
      .eq('match_id', req.params.matchId)
      .order('created_at');

    if (error) throw error;
    res.json(data || []);

  } catch (error) {
    console.error('Get records error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all records for a player (their history)
app.get('/api/players/:playerId/records', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { data, error } = await supabase
      .from('records')
      .select(`
        *,
        match:matches(id, opponent, match_date, gender, location)
      `)
      .eq('player_id', req.params.playerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);

  } catch (error) {
    console.error('Get player records error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get records by matchId (query parameter)
app.get('/api/records', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { matchId } = req.query;

    if (!matchId) {
      return res.status(400).json({ error: 'matchId is required' });
    }

    const { data, error } = await supabase
      .from('records')
      .select(`
        *,
        player:players(id, first_name, last_name, gender)
      `)
      .eq('match_id', matchId)
      .order('created_at');

    if (error) throw error;

    // Format the response to include player_name
    const formattedData = (data || []).map(record => ({
      ...record,
      player_name: record.player ? `${record.player.first_name} ${record.player.last_name}` : 'Unknown Player'
    }));

    res.json(formattedData);

  } catch (error) {
    console.error('Get records error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create or update record (upsert)
app.post('/api/records', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { matchId, playerId, game1, game2, game3, game4, isVarsity } = req.body;

    if (!matchId || !playerId) {
      return res.status(400).json({ error: 'Required: matchId, playerId' });
    }

    const { data, error } = await supabase
      .from('records')
      .upsert([{
        match_id: matchId,
        player_id: playerId,
        game1: game1 !== undefined && game1 !== null ? parseInt(game1) : null,
        game2: game2 !== undefined && game2 !== null ? parseInt(game2) : null,
        game3: game3 !== undefined && game3 !== null ? parseInt(game3) : null,
        game4: game4 !== undefined && game4 !== null ? parseInt(game4) : null,
        is_varsity: isVarsity !== undefined ? isVarsity : true
      }], { onConflict: 'match_id,player_id' })
      .select()
      .single();

    if (error) throw error;
    res.json(data);

  } catch (error) {
    console.error('Create record error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update record
app.put('/api/records/:id', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { game1, game2, game3, game4 } = req.body;

    const updateData = {};
    if (game1 !== undefined) updateData.game1 = parseInt(game1);
    if (game2 !== undefined) updateData.game2 = parseInt(game2);
    if (game3 !== undefined) updateData.game3 = parseInt(game3);
    if (game4 !== undefined) updateData.game4 = parseInt(game4);

    const { data, error } = await supabase
      .from('records')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);

  } catch (error) {
    console.error('Update record error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete record
app.delete('/api/records/:id', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { error } = await supabase
      .from('records')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true, message: 'Record deleted' });

  } catch (error) {
    console.error('Delete record error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete all records for a match
app.delete('/api/records/match/:matchId', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { error } = await supabase
      .from('records')
      .delete()
      .eq('match_id', req.params.matchId);

    if (error) throw error;
    res.json({ success: true, message: 'All records for match deleted' });

  } catch (error) {
    console.error('Delete records by match error:', error);
    res.status(400).json({ error: error.message });
  }
});

// ==================== STATS ENDPOINTS ====================

// Get player stats (aggregated from records)
app.get('/api/players/:playerId/stats', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    // Get all records for this player
    const { data: records, error } = await supabase
      .from('records')
      .select(`
        *,
        match:matches(opponent, match_date)
      `)
      .eq('player_id', req.params.playerId);

    if (error) throw error;

    if (!records || records.length === 0) {
      return res.json({
        matches_played: 0,
        total_pins: 0,
        average: 0,
        high_game: 0,
        high_series: 0,
        records: []
      });
    }

    // Calculate stats
    let totalPins = 0;
    let totalGames = 0;
    let highGame = 0;
    let highSeries = 0;

    records.forEach(r => {
      const series = (r.game1 || 0) + (r.game2 || 0) + (r.game3 || 0) + (r.game4 || 0);
      totalPins += series;
      
      if (r.game1) { totalGames++; highGame = Math.max(highGame, r.game1); }
      if (r.game2) { totalGames++; highGame = Math.max(highGame, r.game2); }
      if (r.game3) { totalGames++; highGame = Math.max(highGame, r.game3); }
      if (r.game4) { totalGames++; highGame = Math.max(highGame, r.game4); }
      
      highSeries = Math.max(highSeries, series);
    });

    res.json({
      matches_played: records.length,
      total_pins: totalPins,
      average: totalGames > 0 ? (totalPins / totalGames).toFixed(1) : 0,
      high_game: highGame,
      high_series: highSeries,
      records
    });

  } catch (error) {
    console.error('Get player stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get team stats (all players for a coach)
app.get('/api/stats/team', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { coachId, gender } = req.query;

    if (!coachId) {
      return res.status(400).json({ error: 'coachId is required' });
    }

    // Get all players for this coach
    const ownerCoachIds = await getOwnerCoachIds(coachId);

    let playersQuery = supabase
      .from('players')
      .select('id, first_name, last_name, gender')
      .in('coach_id', ownerCoachIds)
      .eq('is_active', true);

    if (gender) {
      playersQuery = playersQuery.eq('gender', gender);
    }

    const { data: players, error: playersError } = await playersQuery;
    if (playersError) throw playersError;

    if (!players || players.length === 0) {
      return res.json([]);
    }

    // Get records for all these players
    const playerIds = players.map(p => p.id);
    const { data: records, error: recordsError } = await supabase
      .from('records')
      .select('*')
      .in('player_id', playerIds);

    if (recordsError) throw recordsError;

    // Calculate stats per player
    const stats = players.map(player => {
      const playerRecords = (records || []).filter(r => r.player_id === player.id);
      
      let totalPins = 0;
      let totalGames = 0;
      let highGame = 0;

      playerRecords.forEach(r => {
        if (r.game1) { totalPins += r.game1; totalGames++; highGame = Math.max(highGame, r.game1); }
        if (r.game2) { totalPins += r.game2; totalGames++; highGame = Math.max(highGame, r.game2); }
        if (r.game3) { totalPins += r.game3; totalGames++; highGame = Math.max(highGame, r.game3); }
        if (r.game4) { totalPins += r.game4; totalGames++; highGame = Math.max(highGame, r.game4); }
      });

      return {
        player_id: player.id,
        first_name: player.first_name,
        last_name: player.last_name,
        gender: player.gender,
        matches_played: playerRecords.length,
        total_pins: totalPins,
        average: totalGames > 0 ? (totalPins / totalGames).toFixed(1) : 0,
        high_game: highGame
      };
    });

    // Sort by average descending
    stats.sort((a, b) => parseFloat(b.average) - parseFloat(a.average));

    res.json(stats);

  } catch (error) {
    console.error('Get team stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== START SERVER ====================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎳 Strike Master API running on port ${PORT}`);
  console.log(`Database: ${supabase ? 'Connected' : 'Not configured'}`);
});
