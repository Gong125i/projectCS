// ฟังก์ชันแปลง major code เป็นชื่อภาษาไทย
export const getMajorName = (majorCode?: string): string => {
  if (!majorCode) return '';
  
  const majorMap: { [key: string]: string } = {
    'cs': 'วิทยาการคอมพิวเตอร์',
    'it': 'เทคโนโลยีสารสนเทศ'
  };
  
  return majorMap[majorCode.toLowerCase()] || '';
};

// ฟังก์ชันแปลงชื่อภาษาไทยเป็น major code
export const getMajorCode = (majorName: string): string => {
  const codeMap: { [key: string]: string } = {
    'วิทยาการคอมพิวเตอร์': 'cs',
    'เทคโนโลยีสารสนเทศ': 'it'
  };
  
  return codeMap[majorName] || '';
};
