import styled from "@emotion/styled";

export const SuccessContainer = styled('div')({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #FAEEFA 0%, #FFF5F7 50%, #F0F9FF 100%)',
  padding: '2rem 1rem',
  fontFamily: 'Kanit',
});

export const SuccessBox = styled('div')({
  maxWidth: '650px',
  margin: '60px auto',
  padding: '2rem 2rem',
  background: '#FFFFFF',
  borderRadius: '24px',
  boxShadow: '0 20px 60px rgba(141, 45, 242, 0.15)',
  textAlign: 'center',
  border: '1px solid rgba(141, 45, 242, 0.1)',
});

export const SuccessIcon = styled('div')({
  width: '70px',
  height: '70px',
  margin: '0 auto 1rem',
  background: 'linear-gradient(135deg, #8D2DF2 0%, #C77DFF 100%)',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '42px',
  animation: 'scaleIn 0.5s ease-out',
  '@keyframes scaleIn': {
    '0%': { transform: 'scale(0)', opacity: 0 },
    '50%': { transform: 'scale(1.1)' },
    '100%': { transform: 'scale(1)', opacity: 1 },
  },
});

export const SuccessTitle = styled('h1')({
  fontSize: '32px',
  fontWeight: 700,
  color: '#112B3C',
  marginBottom: '0.75rem',
  fontFamily: 'Kanit',
});

export const SuccessSubtitle = styled('p')({
  fontSize: '16px',
  color: '#6B7280',
  marginBottom: '2.5rem',
  fontFamily: 'Montserrat',
  lineHeight: '1.6',
});

export const DetailCard = styled('div')({
  background: 'linear-gradient(135deg, #FAFAFA 0%, #FFFFFF 100%)',
  borderRadius: '16px',
  padding: '2rem',
  marginBottom: '1.5rem',
  textAlign: 'left',
  border: '2px solid #E8E8E8',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
});

export const DetailRow = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1.2rem 0',
  borderBottom: '1px solid #E8E8E8',
  '&:last-child': {
    borderBottom: 'none',
    paddingBottom: 0,
  },
  '&:first-of-type': {
    paddingTop: 0,
  },
});

export const DetailLabel = styled('span')({
  fontSize: '15px',
  color: '#374151',
  fontFamily: 'Montserrat',
  fontWeight: 600,
});

export const DetailValue = styled('span')({
  fontSize: '16px',
  color: '#112B3C',
  fontFamily: 'Montserrat',
  fontWeight: 700,
});

export const StatusBadgeBase = styled('div')({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.75rem 1.25rem',
  borderRadius: '12px',
  fontSize: '14px',
  fontWeight: 600,
  fontFamily: 'Montserrat',
  marginBottom: '2rem',
});

export const StatusBadgeSuccess = styled(StatusBadgeBase)({
  background: '#ECFDF5',
  color: '#059669',
  border: '1px solid #A7F3D0',
});

export const StatusBadgePending = styled(StatusBadgeBase)({
  background: '#FEF3C7',
  color: '#D97706',
  border: '1px solid #FCD34D',
});

export const StatusBadgeError = styled(StatusBadgeBase)({
  background: '#FEF2F2',
  color: '#DC2626',
  border: '1px solid #FECACA',
});

export const ButtonGroup = styled('div')({
  display: 'flex',
  gap: '1rem',
  marginTop: '2rem',
  '@media (max-width: 480px)': {
    flexDirection: 'column',
  },
});

export const PrimaryButton = styled('button')({
  flex: 1,
  padding: '14px 28px',
  fontSize: '16px',
  fontWeight: 600,
  fontFamily: 'Kanit',
  background: 'linear-gradient(90deg, #8D2DF2 0%, #C77DFF 100%)',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '12px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(141, 45, 242, 0.35)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
});

export const SecondaryButton = styled('button')({
  flex: 1,
  padding: '14px 28px',
  fontSize: '16px',
  fontWeight: 600,
  fontFamily: 'Kanit',
  background: '#FFFFFF',
  color: '#8D2DF2',
  border: '2px solid #8D2DF2',
  borderRadius: '12px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    background: '#FAEEFA',
    transform: 'translateY(-2px)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
});