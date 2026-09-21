import QRCode from 'react-qr-code';

export function QrPayBlock({ link, color }: { link: string; color: string }) {
  if (!link) return null;
  return (
    <div className="qr-row">
      <div style={{ background: '#fff', padding: 8, borderRadius: 12, border: '2px solid #000' }}>
        <QRCode value={link} size={96} fgColor={color === '#ffffff' ? '#111111' : '#111111'} />
      </div>
      <div style={{ fontSize: 13 }}>
        <strong>Scan to pay</strong>
        <div style={{ wordBreak: 'break-all', opacity: 0.8 }}>{link}</div>
      </div>
    </div>
  );
}
