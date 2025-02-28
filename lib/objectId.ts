
class ObjectId {
    private static readonly hexDigits: string = '0123456789abcdef';
  
    static generate(): string {
      const timestamp = Math.floor(Date.now() / 1000).toString(16);
      const random = Array.from({ length: 24 - timestamp.length }, () =>
        this.hexDigits[Math.floor(Math.random() * 16)]
      ).join('');
  
      return timestamp + random;
    }
  }
  
  export default ObjectId;
  