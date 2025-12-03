
export interface BlogItem {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  description: string;
}

export const blogData: BlogItem[] = [
  {
    "id": 1,
    "image": "/template/images/blog1.jpg",
    "title": "Bed Room",
    "subtitle": "The standard chunk",
    "description": "If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden."
  },
  {
    "id": 2,
    "image": "/template/images/blog2.jpg",
    "title": "Bed Room 2",
    "subtitle": "The standard chunk",
    "description": "If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden."
  },
  {
    "id": 3,
    "image": "/template/images/blog3.jpg",
    "title": "Bed Room 4",
    "subtitle": "The standard chunk",
    "description": "If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden."
  }
];
