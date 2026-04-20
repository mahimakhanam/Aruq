import React, { useEffect, useMemo, useState } from 'react';
import { Layout } from './Layout';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase';

import shepherdImg from 'figma:asset/e07eb4216228371c5a3db991432159b2fb2c66ac.png';
import gazaImg from 'figma:asset/37f38f7afdba7a508cc94b0d69483c99a0483c33.png';
import oudImg from 'figma:asset/ff043477831397d8ef4d768c345c147fc1b831f9.png';
import kanafaniImg from 'figma:asset/cd4b37f136953f787cb2dc9f12da621a903cdceb.png';
import karmelImg from 'figma:asset/422c91fffc781da133e0b9a8afdf388e2cca04fd.png';
import darwishImg from 'figma:asset/7130d573ed926ae62b32b2f66d5509baecdfdb83.png';

type ArchiveMediaType = 'Document' | 'Audio' | 'Image' | 'Video';

type ArchiveItem = {
  id: string;
  title: string;
  type: ArchiveMediaType;
  era: string;
  genre: string;
  mediaType: ArchiveMediaType;
  year: string;
  url: string;
  description: string;
  source: 'Curated Archive' | 'Firestore Archive';
  verifiedBy?: string;
  certifiedAt?: string;
  isPublished?: boolean;
};

const filters = {
  era: [
    'Ottoman Era',
    'British Mandate',
    'The Nakba (1948)',
    'Post-1967',
    'First Intifada',
    'Contemporary',
  ],
  genre: ['Poetry', 'Prose', 'Dialects', 'Folk Music', 'Literature'],
  mediaType: ['Document', 'Audio', 'Image', 'Video'],
};

const archiveItems: ArchiveItem[] = [
  {
    id: 'sample-1',
    title: 'Diwan of Mahmoud Darwish',
    type: 'Document',
    era: 'Contemporary',
    genre: 'Poetry',
    mediaType: 'Document',
    year: '1980',
    url: darwishImg,
    description:
        'A poetry collection by Mahmoud Darwish preserved in the archive. This item represents Palestinian literary memory and the role of poetry in expressing identity, exile, resistance, and belonging.',
    source: 'Curated Archive',
    isPublished: true,
  },
  {
    id: 'sample-2',
    title: 'Al-Karmel Literary Magazine',
    type: 'Document',
    era: 'Post-1967',
    genre: 'Literature',
    mediaType: 'Document',
    year: '1982',
    url: karmelImg,
    description:
        'A Palestinian literary and cultural magazine connected to modern literature. It includes cultural writing, criticism, and literary works that support the preservation of Palestinian intellectual heritage.',
    source: 'Curated Archive',
    isPublished: true,
  },
  {
    id: 'sample-3',
    title: 'Oud Performance at Al-Hakawati',
    type: 'Audio',
    era: 'First Intifada',
    genre: 'Folk Music',
    mediaType: 'Audio',
    year: '1989',
    url: oudImg,
    description:
        'An audio record of a traditional oud performance. This item preserves musical heritage and shows how sound and performance can carry cultural memory across generations.',
    source: 'Curated Archive',
    isPublished: true,
  },
  {
    id: 'sample-4',
    title: 'Historical Photo of Gaza',
    type: 'Image',
    era: 'British Mandate',
    genre: 'Dialects',
    mediaType: 'Image',
    year: '1945',
    url: gazaImg,
    description:
        'A historical image connected to Palestinian memory and oral heritage. The item helps users visually explore historical places, community life, and cultural identity.',
    source: 'Curated Archive',
    isPublished: true,
  },
  {
    id: 'sample-5',
    title: 'Ghassan Kanafani: Men in the Sun',
    type: 'Document',
    era: 'Post-1967',
    genre: 'Prose',
    mediaType: 'Document',
    year: '1963',
    url: kanafaniImg,
    description:
        'A famous literary work by Ghassan Kanafani. This archive item represents Palestinian prose and explores themes of displacement, identity, struggle, and human experience.',
    source: 'Curated Archive',
    isPublished: true,
  },
  {
    id: 'sample-6',
    title: 'Palestinian Ataaba',
    type: 'Audio',
    era: 'Ottoman Era',
    genre: 'Folk Music',
    mediaType: 'Audio',
    year: '1910',
    url: shepherdImg,
    description:
        'A poetic vocal genre often performed by farmers and shepherds. Ataaba is connected to oral tradition, rural life, emotional expression, and Palestinian folk heritage.',
    source: 'Curated Archive',
    isPublished: true,
  },
  {
    id: 'sample-7',
    title: 'Traditional Folk Performance',
    type: 'Video',
    era: 'The Nakba (1948)',
    genre: 'Folk Music',
    mediaType: 'Video',
    year: '1948',
    url: shepherdImg,
    description:
        'A preserved folk performance connected to Palestinian heritage. The item represents how movement, rhythm, and community performance preserve cultural memory.',
    source: 'Curated Archive',
    isPublished: true,
  },
  {
    id: 'sample-8',
    title: 'Dialects of Gaza Recording',
    type: 'Audio',
    era: 'British Mandate',
    genre: 'Dialects',
    mediaType: 'Audio',
    year: '1945',
    url: gazaImg,
    description:
        'An audio record showing dialect and oral history. This item helps preserve spoken language, pronunciation, storytelling, and regional cultural identity.',
    source: 'Curated Archive',
    isPublished: true,
  },
];

const getPlaceholderImage = (mediaType: ArchiveMediaType) => {
  if (mediaType === 'Audio') return oudImg;
  if (mediaType === 'Image') return gazaImg;
  if (mediaType === 'Video') return shepherdImg;

  return darwishImg;
};

const convertToMediaType = (value: string): ArchiveMediaType => {
  if (value === 'Audio') return 'Audio';
  if (value === 'Image') return 'Image';
  if (value === 'Video') return 'Video';

  return 'Document';
};

const convertFirestoreDocToArchiveItem = (
    documentId: string,
    data: any
): ArchiveItem => {
  const mediaType = convertToMediaType(data.mediaType || data.type || 'Document');

  return {
    id: documentId,
    title: data.title || 'Untitled Archive Item',
    type: mediaType,
    era: data.era || 'Contemporary',
    genre: data.genre || data.category || 'Literature',
    mediaType,
    year: String(data.year || new Date().getFullYear()),
    url: data.imageURL || data.fileURL || getPlaceholderImage(mediaType),
    description: data.description || 'No description available.',
    source: 'Firestore Archive',
    verifiedBy: data.verifiedBy || data.reviewedBy || 'A’ruq Review Team',
    certifiedAt: data.certifiedAt || data.approvedAt || '',
    isPublished: Boolean(data.isPublished),
  };
};

const getReadableBackendError = (error: unknown) => {
  console.error('Archive Firestore Error:', error);

  const firebaseError = error as { code?: string; message?: string };
  const code = firebaseError.code || '';
  const message = firebaseError.message || '';

  if (code === 'permission-denied') {
    return 'Firestore permission denied. Please check Firestore Rules.';
  }

  if (code === 'unavailable') {
    return 'Firestore is temporarily unavailable. Please check your internet connection.';
  }

  return `Backend error: ${code || message || 'Unknown error'}`;
};

const ArchivePage = () => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ArchiveItem | null>(null);

  const [backendArchiveItems, setBackendArchiveItems] = useState<ArchiveItem[]>(
      []
  );
  const [isLoadingArchive, setIsLoadingArchive] = useState(false);
  const [backendError, setBackendError] = useState('');

  const loadPublishedArchiveItems = async () => {
    try {
      setIsLoadingArchive(true);
      setBackendError('');

      const firestoreItems: ArchiveItem[] = [];

      const archiveItemsRef = collection(db, 'archiveItems');
      const publishedArchiveQuery = query(
          archiveItemsRef,
          where('isPublished', '==', true)
      );

      const archiveSnapshot = await getDocs(publishedArchiveQuery);

      archiveSnapshot.forEach((document) => {
        firestoreItems.push(
            convertFirestoreDocToArchiveItem(document.id, document.data())
        );
      });

      const submissionsRef = collection(db, 'submissions');
      const publishedSubmissionsQuery = query(
          submissionsRef,
          where('isPublished', '==', true)
      );

      const submissionsSnapshot = await getDocs(publishedSubmissionsQuery);

      submissionsSnapshot.forEach((document) => {
        firestoreItems.push(
            convertFirestoreDocToArchiveItem(document.id, document.data())
        );
      });

      setBackendArchiveItems(firestoreItems);
    } catch (error) {
      setBackendError(getReadableBackendError(error));
    } finally {
      setIsLoadingArchive(false);
    }
  };

  useEffect(() => {
    loadPublishedArchiveItems();
  }, []);

  const allArchiveItems = useMemo(() => {
    return [...backendArchiveItems, ...archiveItems];
  }, [backendArchiveItems]);

  const toggleFilter = (filter: string) => {
    setActiveFilters((previousFilters) =>
        previousFilters.includes(filter)
            ? previousFilters.filter((item) => item !== filter)
            : [...previousFilters, filter]
    );
  };

  const clearAll = () => {
    setSearchQuery('');
    setActiveFilters([]);
  };

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const selectedEraFilters = activeFilters.filter((filter) =>
        filters.era.includes(filter)
    );

    const selectedGenreFilters = activeFilters.filter((filter) =>
        filters.genre.includes(filter)
    );

    const selectedMediaTypeFilters = activeFilters.filter((filter) =>
        filters.mediaType.includes(filter)
    );

    const results = allArchiveItems.filter((item) => {
      const matchesSearch =
          query === '' ||
          item.title.toLowerCase().includes(query) ||
          item.type.toLowerCase().includes(query) ||
          item.era.toLowerCase().includes(query) ||
          item.genre.toLowerCase().includes(query) ||
          item.mediaType.toLowerCase().includes(query) ||
          item.year.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.source.toLowerCase().includes(query) ||
          item.verifiedBy?.toLowerCase().includes(query);

      const matchesEra =
          selectedEraFilters.length === 0 || selectedEraFilters.includes(item.era);

      const matchesGenre =
          selectedGenreFilters.length === 0 ||
          selectedGenreFilters.includes(item.genre);

      const matchesMediaType =
          selectedMediaTypeFilters.length === 0 ||
          selectedMediaTypeFilters.includes(item.mediaType);

      return matchesSearch && matchesEra && matchesGenre && matchesMediaType;
    });

    if (!query) {
      return results;
    }

    return [...results].sort((a, b) => {
      const getScore = (item: ArchiveItem) => {
        let score = 0;

        if (item.title.toLowerCase().includes(query)) score += 5;
        if (item.era.toLowerCase().includes(query)) score += 4;
        if (item.genre.toLowerCase().includes(query)) score += 3;
        if (item.mediaType.toLowerCase().includes(query)) score += 3;
        if (item.source.toLowerCase().includes(query)) score += 3;
        if (item.verifiedBy?.toLowerCase().includes(query)) score += 2;
        if (item.year.toLowerCase().includes(query)) score += 2;
        if (item.description.toLowerCase().includes(query)) score += 1;

        return score;
      };

      return getScore(b) - getScore(a);
    });
  }, [searchQuery, activeFilters, allArchiveItems]);

  return (
      <Layout>
        <div className="bg-stone-100 min-h-screen">
          <div className="bg-white border-b border-stone-200 shadow-sm">
            <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row gap-4 items-center justify-between">
              <h1 className="text-2xl font-bold text-pal-black flex items-center gap-2">
                Literary Archive
                <span className="text-pal-red text-sm font-normal bg-red-50 px-2 py-1 rounded-full">
                {filteredItems.length} Items
              </span>
              </h1>

              <div className="flex w-full md:w-auto gap-2 items-center">
                <div className="relative flex-1 md:w-[500px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />

                  <input
                      type="text"
                      placeholder="Search by title, era, genre, media type, source, or year..."
                      className="w-full pl-10 pr-10 py-2 bg-white text-stone-900 placeholder:text-stone-400 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pal-green/20"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                  />

                  {searchQuery && (
                      <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-pal-red"
                          aria-label="Clear search"
                      >
                        <X className="w-4 h-4" />
                      </button>
                  )}
                </div>

                <button
                    type="button"
                    onClick={loadPublishedArchiveItems}
                    disabled={isLoadingArchive}
                    className="hidden md:flex items-center gap-2 px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white hover:bg-stone-50 disabled:opacity-60"
                >
                  <RefreshCw
                      className={`w-4 h-4 ${
                          isLoadingArchive ? 'animate-spin' : ''
                      }`}
                  />
                  Refresh
                </button>

                <button
                    type="button"
                    className="md:hidden p-2 bg-stone-100 rounded-lg border border-stone-200"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    aria-label="Open filters"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {backendError && (
              <div className="container mx-auto px-4 pt-6">
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />

                  <div className="flex-1">
                    <p className="font-bold">Backend Error</p>
                    <p className="text-sm mt-1">{backendError}</p>
                  </div>

                  <button
                      type="button"
                      onClick={() => setBackendError('')}
                      className="text-red-700 hover:text-red-900"
                      aria-label="Close backend error"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
          )}

          <div className="container mx-auto px-4 py-8 flex gap-8 relative">
            <aside
                className={`
              fixed md:relative inset-y-0 left-0 z-40 w-72 bg-white md:bg-transparent shadow-xl md:shadow-none transform transition-transform duration-300 ease-in-out md:translate-x-0
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              p-6 md:p-0 md:block h-full overflow-y-auto md:overflow-visible
            `}
            >
              <div className="flex justify-between items-center md:hidden mb-6">
                <h2 className="text-xl font-bold text-stone-900">Filters</h2>

                <button
                    type="button"
                    onClick={() => setIsSidebarOpen(false)}
                    aria-label="Close filters"
                >
                  <X className="w-6 h-6 text-stone-900" />
                </button>
              </div>

              <div className="space-y-6">
                <FilterSection
                    title="Historical Era"
                    options={filters.era}
                    activeFilters={activeFilters}
                    toggleFilter={toggleFilter}
                />

                <FilterSection
                    title="Genre"
                    options={filters.genre}
                    activeFilters={activeFilters}
                    toggleFilter={toggleFilter}
                />

                <FilterSection
                    title="Media Type"
                    options={filters.mediaType}
                    activeFilters={activeFilters}
                    toggleFilter={toggleFilter}
                />
              </div>
            </aside>

            {isSidebarOpen && (
                <button
                    type="button"
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                    aria-label="Close filter menu"
                />
            )}

            <main className="flex-1 min-w-0">
              {(activeFilters.length > 0 || searchQuery) && (
                  <div className="mb-6 space-y-3">
                    {searchQuery && (
                        <p className="text-sm text-stone-600">
                          Search results for:{' '}
                          <span className="font-semibold text-pal-black">
                      &quot;{searchQuery}&quot;
                    </span>
                        </p>
                    )}

                    {activeFilters.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {activeFilters.map((filter) => (
                              <span
                                  key={filter}
                                  className="bg-pal-black text-white px-3 py-1 rounded-full text-sm flex items-center gap-1"
                              >
                        {filter}

                                <button
                                    type="button"
                                    onClick={() => toggleFilter(filter)}
                                    aria-label={`Remove ${filter} filter`}
                                >
                          <X className="w-3 h-3 hover:text-red-400" />
                        </button>
                      </span>
                          ))}

                          <button
                              type="button"
                              onClick={() => setActiveFilters([])}
                              className="text-stone-500 text-sm hover:text-pal-red underline decoration-dotted"
                          >
                            Clear filters
                          </button>
                        </div>
                    )}
                  </div>
              )}

              {isLoadingArchive ? (
                  <div className="text-center py-20 bg-white rounded-xl border border-stone-200">
                    <RefreshCw className="w-10 h-10 mx-auto text-stone-300 animate-spin mb-3" />

                    <p className="text-stone-600 font-medium">
                      Loading verified archive items from Firestore...
                    </p>
                  </div>
              ) : filteredItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map((item) => (
                        <ArchiveItemCard
                            key={item.id}
                            item={item}
                            onSelect={setSelectedItem}
                        />
                    ))}
                  </div>
              ) : (
                  <div className="text-center py-20 bg-white rounded-xl border border-stone-200">
                    <p className="text-stone-600 font-medium">
                      No items found matching your criteria.
                    </p>

                    <p className="text-stone-400 text-sm mt-2">
                      Try using another keyword or removing some filters.
                    </p>

                    <button
                        type="button"
                        onClick={clearAll}
                        className="mt-4 text-pal-red font-medium hover:underline"
                    >
                      Reset search and filters
                    </button>
                  </div>
              )}
            </main>
          </div>
        </div>

        <ArchiveDetailsModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
        />
      </Layout>
  );
};

type FilterSectionProps = {
  title: string;
  options: string[];
  activeFilters: string[];
  toggleFilter: (filter: string) => void;
};

const FilterSection = ({
                         title,
                         options,
                         activeFilters,
                         toggleFilter,
                       }: FilterSectionProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
      <div className="border-b border-stone-200 pb-4">
        <button
            type="button"
            className="flex items-center justify-between w-full font-semibold text-stone-800 mb-2 hover:text-pal-red"
            onClick={() => setIsOpen(!isOpen)}
        >
          {title}

          {isOpen ? (
              <ChevronUp className="w-4 h-4" />
          ) : (
              <ChevronDown className="w-4 h-4" />
          )}
        </button>

        <AnimatePresence>
          {isOpen && (
              <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
              >
                <div className="space-y-2 pt-2">
                  {options.map((option) => (
                      <label
                          key={option}
                          className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer hover:text-pal-black"
                      >
                        <input
                            type="checkbox"
                            checked={activeFilters.includes(option)}
                            onChange={() => toggleFilter(option)}
                            className="rounded border-stone-300 text-pal-green focus:ring-pal-green"
                        />

                        {option}
                      </label>
                  ))}
                </div>
              </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
};

type ArchiveItemCardProps = {
  item: ArchiveItem;
  onSelect: (item: ArchiveItem) => void;
};

const ArchiveItemCard = ({ item, onSelect }: ArchiveItemCardProps) => (
    <motion.button
        type="button"
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => onSelect(item)}
        className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all group cursor-pointer text-left"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        <img
            src={item.url}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
          {item.mediaType}
        </div>

        {item.source === 'Firestore Archive' && (
            <div className="absolute top-2 right-2 bg-pal-green text-white text-xs px-2 py-1 rounded">
              Verified
            </div>
        )}
      </div>

      <div className="p-4 border-t border-stone-100">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-stone-800 group-hover:text-pal-red transition-colors line-clamp-1">
            {item.title}
          </h3>
        </div>

        <p className="text-xs text-stone-500 mt-2 line-clamp-2">
          {item.description}
        </p>

        <div className="flex flex-wrap gap-2 text-xs text-stone-500 mt-3">
        <span className="bg-stone-100 px-2 py-1 rounded text-stone-600">
          {item.era}
        </span>

          <span className="bg-stone-100 px-2 py-1 rounded text-stone-600">
          {item.genre}
        </span>

          <span className="bg-stone-100 px-2 py-1 rounded text-stone-600">
          {item.year}
        </span>
        </div>

        <p className="text-xs text-pal-red font-semibold mt-4">
          Click to view details →
        </p>
      </div>
    </motion.button>
);

const ArchiveDetailsModal = ({
                               item,
                               onClose,
                             }: {
  item: ArchiveItem | null;
  onClose: () => void;
}) => {
  if (!item) return null;

  return (
      <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center px-4">
        <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white max-w-3xl w-full rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          <div className="relative h-64 bg-stone-100">
            <img
                src={item.url}
                alt={item.title}
                className="w-full h-full object-cover"
            />

            <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 bg-white/90 hover:bg-white text-stone-900 rounded-full p-2 shadow"
                aria-label="Close details"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-3 py-1 rounded-full">
              {item.mediaType}
            </div>

            {item.source === 'Firestore Archive' && (
                <div className="absolute bottom-4 right-4 bg-pal-green text-white text-xs px-3 py-1 rounded-full">
                  Verified from Firestore
                </div>
            )}
          </div>

          <div className="p-8 space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-stone-900">
                {item.title}
              </h2>

              <p className="text-sm text-stone-500 mt-1">
                {item.source} • {item.year}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
            <span className="bg-stone-100 text-stone-700 px-3 py-1 rounded-full text-sm">
              Era: {item.era}
            </span>

              <span className="bg-stone-100 text-stone-700 px-3 py-1 rounded-full text-sm">
              Genre: {item.genre}
            </span>

              <span className="bg-stone-100 text-stone-700 px-3 py-1 rounded-full text-sm">
              Type: {item.mediaType}
            </span>

              {item.source === 'Firestore Archive' && (
                  <span className="bg-green-50 border border-green-200 text-pal-green px-3 py-1 rounded-full text-sm">
                Published: true
              </span>
              )}
            </div>

            {item.source === 'Firestore Archive' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                  <h3 className="font-bold text-stone-800 mb-2">
                    Backend Verification Record
                  </h3>

                  <p className="text-sm text-stone-600">
                    This archive item was loaded from Firestore because its backend
                    field <strong>isPublished</strong> is set to <strong>true</strong>.
                  </p>

                  <p className="text-sm text-stone-600 mt-2">
                    Verified by: {item.verifiedBy || 'A’ruq Review Team'}
                  </p>
                </div>
            )}

            <div className="bg-stone-50 border border-stone-200 rounded-xl p-5">
              <h3 className="font-bold text-stone-800 mb-2">
                Description / Reading Preview
              </h3>

              <p className="text-stone-600 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="bg-pal-green/5 border border-pal-green/20 rounded-xl p-5">
              <h3 className="font-bold text-stone-800 mb-2">
                Cultural Importance
              </h3>

              <p className="text-stone-600 leading-relaxed">
                This record is part of the A&apos;ruq archive because it helps
                preserve Palestinian cultural memory through literature, oral
                history, music, image, or performance. It supports the project goal
                of making heritage easier to browse, study, and protect.
              </p>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="font-bold text-stone-800 text-sm">
                  Want to continue reading?
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Open this archive item in a full-screen reading view.
                </p>
              </div>

              <button
                  type="button"
                  onClick={() =>
                      alert(
                          'Full-screen reading mode is planned for a future version of this prototype.'
                      )
                  }
                  className="px-5 py-2 rounded-lg border border-pal-red text-pal-red font-semibold hover:bg-red-50"
              >
                Read More / Full View
              </button>
            </div>

            <div className="flex justify-end">
              <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-lg bg-pal-red text-white font-semibold hover:bg-red-700"
              >
                Close Details
              </button>
            </div>
          </div>
        </motion.div>
      </div>
  );
};

export default ArchivePage;