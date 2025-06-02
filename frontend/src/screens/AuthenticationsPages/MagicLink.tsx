//src/screens/AuthenticationsPages/MagicLink.tsx
import React, { useEffect, useState } from 'react';
import {
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  setPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { auth } from '@/configFirebase/Firebase';
import { useNavigate } from 'react-router-dom';

import MagicLinkHeader from '@/components/AuthComponents/MagicLink/MagicLinkHeader';
import MagicLinkForm from '@/components/AuthComponents/MagicLink/MagicLinkForm';
import MagicLinkMessage from '@/components/AuthComponents/MagicLink/MagicLinkMessage';

const MagicLink: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const completeMagicLogin = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        const storedEmail = window.localStorage.getItem('emailForSignIn');
        let emailToUse = storedEmail || window.prompt('Entrez votre email pour confirmer');

        if (!emailToUse) {
          setError("Email requis pour terminer la connexion.");
          return;
        }

        try {
          await setPersistence(auth, browserSessionPersistence); // ✅ secure session
          await signInWithEmailLink(auth, emailToUse, window.location.href);
          window.localStorage.removeItem('emailForSignIn');
          navigate('/dashboard');
        } catch {
          setError("Lien invalide ou expiré.");
        }
      }
    };

    completeMagicLogin();
  }, [navigate]);

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    const actionCodeSettings = {
      url: `${window.location.origin}/magic-link`,
      handleCodeInApp: true
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setMessage("📩 Lien envoyé ! Vérifiez votre boîte de réception.");
    } catch {
      setError("Erreur lors de l'envoi du lien.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow-sm border-0 rounded-4 p-4" style={{ maxWidth: 480, width: '100%' }}>
        <MagicLinkHeader />
        <MagicLinkMessage message={message} error={error} />
        <MagicLinkForm
          email={email}
          onChange={(e) => setEmail(e.target.value)}
          onSubmit={handleSendLink}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default MagicLink;
