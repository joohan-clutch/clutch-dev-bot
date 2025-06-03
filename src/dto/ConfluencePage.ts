export type ConfluencePage = {
  id: string;
  body: {
    storage: {
      value: string; // HTML content
      representation: string;
    };
  };
};
