export const CLUSTER_LIST = ['svani', 'chava', 'svasti', 'jivva', 'vasya', 'svadhi', 'others'] as const;

export const CLUSTER_LABELS: Record<(typeof CLUSTER_LIST)[number], string> = {
  svani: 'Blok A - Svani',
  chava: 'Blok B - Chava',
  svasti: 'Blok C - Svasti',
  jivva: 'Blok DE - Jivva',
  vasya: 'Blok F - Vasya',
  svadhi: 'Blok G - Svadhi',
  others: 'Others',
} as const;
