import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { sendEmailViaResend } from '../services/resendService';
import { sendEmailViaBrevo } from '../services/brevoService';
import { sendEmailViaWeb3Forms } from '../services/web3formsService';
import { sendEmailViaSendGrid } from '../services/sendgridService';
import { sendEmailViaFormspree } from '../services/formspreeService';
import { EMAIL_SERVICE } from '../config/emailService';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  Github, 
  Linkedin, 
  Twitter,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const ContactSection: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check email service configuration
  useEffect(() => {
    const service = EMAIL_SERVICE;
    console.log(`Using email service: ${service}`);
    
    // Warn if service is not configured
    if (service === 'brevo' && !import.meta.env.VITE_BREVO_API_KEY) {
      console.warn('Brevo API key is not configured. Please add VITE_BREVO_API_KEY to your .env file.');
    } else if (service === 'web3forms' && !import.meta.env.VITE_WEB3FORMS_ACCESS_KEY) {
      console.warn('Web3Forms access key is not configured. Please add VITE_WEB3FORMS_ACCESS_KEY to your .env file.');
    } else if (service === 'formspree' && !import.meta.env.VITE_FORMSPREE_FORM_ID) {
      console.warn('Formspree form ID is not configured. Please add VITE_FORMSPREE_FORM_ID to your .env file.');
    } else if (service === 'sendgrid' && !import.meta.env.VITE_SENDGRID_API_KEY) {
      console.warn('SendGrid API key is not configured. Please add VITE_SENDGRID_API_KEY to your .env file.');
    } else if (service === 'resend' && !import.meta.env.VITE_RESEND_API_KEY) {
      console.warn('Resend API key is not configured. Please add VITE_RESEND_API_KEY to your .env file.');
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage(null);
    
    try {
      let result;
      const emailData = {
        name: formData.name,
        email: formData.email,
        message: formData.message
      };

      // Use the configured email service
      switch (EMAIL_SERVICE) {
        case 'brevo':
          result = await sendEmailViaBrevo(emailData);
          break;
        case 'web3forms':
          result = await sendEmailViaWeb3Forms(emailData);
          break;
        case 'formspree':
          result = await sendEmailViaFormspree(emailData);
          break;
        case 'sendgrid':
          result = await sendEmailViaSendGrid(emailData);
          break;
        case 'resend':
        default:
          result = await sendEmailViaResend(emailData);
          break;
      }

      if (result.success) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setSubmitStatus('error');
        setErrorMessage(result.error || t('contact.errorGeneric'));
      }
    } catch (error: any) {
      console.error('Email Service Error:', error);
      setSubmitStatus('error');
      setErrorMessage(error?.message || t('contact.errorGeneric'));
    } finally {
      setIsSubmitting(false);
      // Reset status na 5 seconden
      setTimeout(() => {
        setSubmitStatus('idle');
        setErrorMessage(null);
      }, 5000);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'florthiers@gmail.com',
      link: 'mailto:florthiers@gmail.com',
      color: 'neon-green'
    },
    {
      icon: Phone,
      title: 'Phone',
      value: '+32 123 456 789',
      link: 'tel:+32123456789',
      color: 'neon-blue'
    },
    {
      icon: MapPin,
      title: 'Location',
      value: 'Gent, Belgium',
      link: '#',
      color: 'neon-pink'
    }
  ];

  const socialLinks = [
    {
      name: 'GitHub',
      icon: Github,
      url: 'https://github.com/FlorianThiers',
      color: 'hover:text-white'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: 'https://www.linkedin.com/in/florian-thiers-2908ba305/',
      color: 'hover:text-neon-blue'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: 'https://twitter.com',
      color: 'hover:text-neon-green'
    }
  ];

  return (
    <section id="contact" className="section-padding bg-dark-bg relative overflow-hidden">
      {/* Decoratieve achtergrond elementen */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-32 left-32 w-80 h-80 bg-neon-green rounded-full blur-3xl" />
        <div className="absolute bottom-32 right-32 w-96 h-96 bg-neon-blue rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 neon-text">
            {t('contact.title')}
          </h2>
          <p className="text-xl text-white/70 mb-8">
            {t('contact.subtitle')}
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-neon-green to-neon-blue mx-auto rounded-full" />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-white mb-6">
              {t('contact.sendMessage')}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Input */}
              <div>
                <label htmlFor="name" className="block text-white/80 text-sm font-medium mb-2">
                  {t('contact.name')}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-dark-secondary border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green/20 transition-all duration-300"
                  placeholder={t('contact.yourName')}
                />
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-white/80 text-sm font-medium mb-2">
                  {t('contact.email')}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-dark-secondary border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green/20 transition-all duration-300"
                  placeholder={t('contact.yourEmail')}
                />
              </div>

              {/* Message Input */}
              <div>
                <label htmlFor="message" className="block text-white/80 text-sm font-medium mb-2">
                  {t('contact.message')}
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 bg-dark-secondary border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green/20 transition-all duration-300 resize-none"
                  placeholder={t('contact.tellMeAboutProject')}
                />
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-neon-green to-neon-blue text-dark-bg font-bold py-3 px-8 rounded-lg hover:shadow-2xl hover:shadow-neon-green/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-dark-bg border-t-transparent rounded-full animate-spin" />
                    <span>{t('contact.sending')}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Send size={20} />
                    <span>{t('contact.send')}</span>
                  </div>
                )}
              </motion.button>

              {/* Status Messages */}
              {submitStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 text-neon-green bg-neon-green/20 p-3 rounded-lg"
                >
                  <CheckCircle size={20} />
                  <span>{t('contact.messageSentSuccess')}</span>
                </motion.div>
              )}

              {submitStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 text-red-400 bg-red-400/20 p-3 rounded-lg"
                >
                  <AlertCircle size={20} />
                  <span>{errorMessage || t('contact.errorGeneric')}</span>
                </motion.div>
              )}
            </form>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-white mb-6">
              {t('contact.getInTouch')}
            </h3>

            {/* Contact Details */}
            <div className="space-y-6 mb-8">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-4"
                >
                  <div className={`w-12 h-12 bg-${info.color}/20 rounded-lg flex items-center justify-center border border-${info.color}/30`}>
                    <info.icon className={`w-6 h-6 text-${info.color}`} />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{info.title}</h4>
                    <a
                      href={info.link}
                      className={`text-${info.color} hover:text-white transition-colors duration-200`}
                    >
                      {info.value}
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Social Links */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-white mb-4">{t('contact.followMe')}</h4>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.1, y: -5 }}
                    className={`w-12 h-12 bg-dark-secondary border border-white/20 rounded-lg flex items-center justify-center text-white/70 ${social.color} transition-all duration-300 hover:border-neon-green/50`}
                  >
                    <social.icon size={24} />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Availability Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-neon-green/20 to-neon-blue/20 rounded-xl p-6 border border-neon-green/30"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-3 h-3 bg-neon-green rounded-full animate-pulse" />
                <span className="text-neon-green font-semibold">{t('contact.available')}</span>
              </div>
              <p className="text-white/80 text-sm">
                {t('contact.availabilityDescription')}
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-neon-green/20 to-neon-blue/20 rounded-2xl p-8 border border-neon-green/30">
            <h3 className="text-2xl font-bold text-white mb-4">
              {t('contact.readyToStart')}
            </h3>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              {t('contact.readyToStartDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                className="bg-gradient-to-r from-neon-green to-neon-blue text-dark-bg font-bold py-3 px-8 rounded-full hover:shadow-2xl hover:shadow-neon-green/30 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const form = document.querySelector('form');
                  if (form) {
                    form.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                {t('contact.startProject')}
              </motion.button>
              <motion.button
                className="border-2 border-neon-green text-neon-green font-bold py-3 px-8 rounded-full hover:bg-neon-green hover:text-dark-bg transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t('contact.scheduleCall')}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

