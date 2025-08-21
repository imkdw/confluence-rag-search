export interface ConfluencePage {
  id: string;
  title: string;
  parentId: string;
  ownerId: string;
  lastOwnerId: unknown;
  createdAt: string;
  authorId: string;
  parentType: string;
  version: unknown;
  position: number;
  spaceId: string;
  status: string;
  body: unknown;
  _links: {
    editui: string;
    webui: string;
    edituiv2: string;
    tinyui: string;
  };
}

export interface ConfluencePageDetail extends ConfluencePage {
  body: {
    editor: {
      representation: 'editor';
      value: string;
    };
  };
}
