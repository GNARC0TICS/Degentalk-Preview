import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface GifPickerProps {
  onSelect?: (gifUrl: string) => void;
  onGifSelect?: (gifUrl: string) => void; // For backward compatibility
  onClose?: () => void;
  buttonContent?: React.ReactNode;
  isLevelRestricted?: boolean;
  isDialog?: boolean;
}

interface GifData {
  id: string;
  title: string;
  images: {
    fixed_height: {
      url: string;
      height: string;
      width: string;
    };
    original: {
      url: string;
    };
  };
}

export function EnhancedGifPicker({ 
  onSelect, 
  onGifSelect, 
  onClose, 
  buttonContent, 
  isLevelRestricted = false,
  isDialog = true
}: GifPickerProps) {
  const [search, setSearch] = useState('');
  const [gifs, setGifs] = useState<GifData[]>([]);
  const [trendingGifs, setTrendingGifs] = useState<GifData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [giphyEnabled, setGiphyEnabled] = useState(true);
  const [manualGifUrl, setManualGifUrl] = useState('');
  const [imgLoadErrors, setImgLoadErrors] = useState<{[key: string]: boolean}>({});
  
  // Use onSelect if provided, otherwise fall back to onGifSelect for backward compatibility
  const handleGifSelected = onSelect || onGifSelect;

  // Fetch trending GIFs on initial load
  useEffect(() => {
    if (open && trendingGifs.length === 0) {
      fetchTrendingGifs();
    }
  }, [open]);

  // Check if Giphy is enabled in site settings
  useEffect(() => {
    const checkGiphyStatus = async () => {
      try {
        const response = await fetch('/api/editor/giphy-status');
        const data = await response.json();
        setGiphyEnabled(data.enabled);
      } catch (err) {
        console.error('Failed to check Giphy status:', err);
        setGiphyEnabled(false);
        setError('Failed to check GIF service status. You can still enter a direct GIF URL.');
      }
    };
    
    checkGiphyStatus();
  }, []);

  // Get trending GIFs from Giphy
  const fetchTrendingGifs = async () => {
    if (!giphyEnabled) {
      setError('GIF search is currently disabled by the administrator.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/editor/giphy-trending');
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      const result = await response.json();
      setTrendingGifs(result.data || []);
    } catch (err) {
      console.error('Error fetching trending GIFs:', err);
      setError('Failed to load trending GIFs. You can still enter a direct GIF URL.');
    } finally {
      setLoading(false);
    }
  };

  // Search for GIFs based on query
  const searchGifs = async () => {
    if (!search.trim() || !giphyEnabled) {
      return;
    }
    
    setSearchLoading(true);
    setSearchError(null);
    
    try {
      const response = await fetch('/api/editor/giphy-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: search })
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      
      const result = await response.json();
      setGifs(result.data || []);
    } catch (err) {
      console.error('Error searching GIFs:', err);
      setSearchError('Failed to search for GIFs. Please try again later or enter a direct GIF URL.');
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle selecting a GIF
  const handleSelectGif = (gif: GifData) => {
    if (handleGifSelected) {
      handleGifSelected(gif.images.original.url);
    }
    
    // Handle dialog closing
    if (!isDialog) {
      if (onClose) {
        onClose();
      }
    } else {
      setOpen(false);
    }
  };

  // Handle manual GIF URL submission
  const handleManualGifSubmit = () => {
    if (manualGifUrl && manualGifUrl.trim() !== '' && handleGifSelected) {
      handleGifSelected(manualGifUrl.trim());
      if (!isDialog && onClose) {
        onClose();
      } else {
        setOpen(false);
      }
    }
  };

  // Handle search input enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      searchGifs();
    }
  };

  // Handle manual URL input enter key
  const handleManualKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleManualGifSubmit();
    }
  };

  // Handle image load error
  const handleImageError = (id: string) => {
    setImgLoadErrors(prev => ({ ...prev, [id]: true }));
  };

  if (isLevelRestricted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground opacity-50 cursor-not-allowed"
        disabled
      >
        {buttonContent}
      </Button>
    );
  }

  if (!giphyEnabled) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground opacity-50 cursor-not-allowed"
        disabled
        title="GIF search is currently disabled"
      >
        {buttonContent}
      </Button>
    );
  }

  // Fallback UI for direct URL input
  const fallbackUI = (
    <div className="flex flex-col justify-center items-center p-4 text-center">
      <div className="flex items-center mb-2 text-amber-400">
        <AlertCircle className="h-4 w-4 mr-2" />
        <span>Having trouble loading GIFs?</span>
      </div>
      <p className="text-zinc-400 text-sm mb-4">
        You can still add GIFs by entering a direct URL:
      </p>
      <div className="w-full max-w-sm">
        <div className="flex gap-2">
          <Input 
            placeholder="Enter GIF URL..." 
            className="bg-zinc-700 border-zinc-600 text-white"
            onChange={(e) => setManualGifUrl(e.target.value)}
            value={manualGifUrl}
            onKeyDown={handleManualKeyPress}
          />
          <Button 
            onClick={handleManualGifSubmit}
            disabled={!manualGifUrl || manualGifUrl.trim() === ''}
          >
            Insert
          </Button>
        </div>
      </div>
    </div>
  );

  // Content for the GIF picker
  const contentUI = (
    <>
      <div className="flex items-center gap-2 mb-4">
        <Input
          placeholder="Search for GIFs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyPress}
          className="bg-zinc-700 border-zinc-600 text-white"
        />
        <Button 
          onClick={searchGifs}
          variant="default"
          disabled={searchLoading || !search.trim()}
        >
          {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
        </Button>
      </div>
      
      <Tabs defaultValue="trending" className="w-full">
        <TabsList className="w-full mb-2 bg-zinc-700">
          <TabsTrigger value="trending" className="data-[state=active]:bg-zinc-600">Trending</TabsTrigger>
          <TabsTrigger value="search" className="data-[state=active]:bg-zinc-600" disabled={gifs.length === 0}>Search Results</TabsTrigger>
          <TabsTrigger value="manual" className="data-[state=active]:bg-zinc-600">Direct URL</TabsTrigger>
        </TabsList>
        
        <div className="overflow-y-auto flex-1 h-[400px] border border-zinc-700 rounded p-2">
          <TabsContent value="trending" className="m-0">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            ) : error ? (
              <div className="flex flex-col justify-center items-center h-full p-4 text-center">
                <div className="text-red-400 mb-2">{error}</div>
                {fallbackUI}
              </div>
            ) : trendingGifs.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-full p-4 text-center">
                <p className="text-zinc-400 mb-2">No trending GIFs found.</p>
                <p className="text-zinc-400 text-sm">Try searching for a specific term instead.</p>
                {fallbackUI}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {trendingGifs.map((gif) => (
                  <div 
                    key={gif.id}
                    onClick={() => !imgLoadErrors[gif.id] && handleSelectGif(gif)}
                    className={`cursor-pointer hover:opacity-80 transition-opacity rounded overflow-hidden bg-zinc-900 flex items-center justify-center h-[150px] ${imgLoadErrors[gif.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {imgLoadErrors[gif.id] ? (
                      <div className="flex flex-col items-center justify-center p-2 text-center">
                        <AlertCircle className="h-8 w-8 text-amber-500 mb-1" />
                        <span className="text-xs text-zinc-400">Image failed to load</span>
                      </div>
                    ) : (
                      <img 
                        src={gif.images.fixed_height.url} 
                        alt={gif.title}
                        className="max-h-full"
                        onError={() => handleImageError(gif.id)}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="search" className="m-0">
            {searchLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            ) : searchError ? (
              <div className="flex flex-col justify-center items-center h-full p-4 text-center">
                <div className="text-red-400 mb-2">{searchError}</div>
                {fallbackUI}
              </div>
            ) : gifs.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-full p-4 text-center">
                <p className="text-zinc-400 mb-2">No GIFs found for "{search}".</p>
                <p className="text-zinc-400 text-sm">Try a different search term or enter a direct URL.</p>
                {fallbackUI}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {gifs.map((gif) => (
                  <div 
                    key={gif.id}
                    onClick={() => !imgLoadErrors[gif.id] && handleSelectGif(gif)}
                    className={`cursor-pointer hover:opacity-80 transition-opacity rounded overflow-hidden bg-zinc-900 flex items-center justify-center h-[150px] ${imgLoadErrors[gif.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {imgLoadErrors[gif.id] ? (
                      <div className="flex flex-col items-center justify-center p-2 text-center">
                        <AlertCircle className="h-8 w-8 text-amber-500 mb-1" />
                        <span className="text-xs text-zinc-400">Image failed to load</span>
                      </div>
                    ) : (
                      <img 
                        src={gif.images.fixed_height.url} 
                        alt={gif.title}
                        className="max-h-full"
                        onError={() => handleImageError(gif.id)}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="manual" className="m-0">
            <div className="flex flex-col justify-center items-center h-full p-4">
              <div className="w-full max-w-sm mb-4">
                <h3 className="text-lg font-medium text-white mb-2">Enter a GIF URL</h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Paste a direct link to a GIF from any website.
                </p>
                
                <div className="flex flex-col gap-2">
                  <Input 
                    placeholder="https://example.com/your-gif.gif" 
                    className="bg-zinc-700 border-zinc-600 text-white"
                    onChange={(e) => setManualGifUrl(e.target.value)}
                    value={manualGifUrl}
                    onKeyDown={handleManualKeyPress}
                  />
                  
                  {manualGifUrl && manualGifUrl.trim() !== '' && (
                    <div className="border border-zinc-700 rounded p-2 flex justify-center items-center h-[200px] bg-zinc-900">
                      <img 
                        src={manualGifUrl} 
                        alt="Preview" 
                        className="max-h-full max-w-full"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          document.getElementById('gif-error-msg')!.style.display = 'flex';
                        }}
                      />
                      <div 
                        id="gif-error-msg" 
                        style={{display: 'none'}}
                        className="flex-col items-center justify-center text-center"
                      >
                        <AlertCircle className="h-8 w-8 text-amber-500 mb-1" />
                        <span className="text-sm text-zinc-400">Unable to preview image</span>
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleManualGifSubmit}
                    disabled={!manualGifUrl || manualGifUrl.trim() === ''}
                    className="mt-2"
                  >
                    Insert GIF
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
      
      <div className="mt-2 text-xs text-zinc-400 text-center">
        Powered by GIPHY
      </div>
    </>
  );

  // If this is not a dialog (e.g., used directly in the rich text editor)
  if (!isDialog) {
    return (
      <div className="sm:max-w-[550px] max-h-[80vh] overflow-hidden flex flex-col bg-zinc-800 border border-zinc-700 text-white rounded-md">
        <div className="p-4 border-b border-zinc-700">
          <h2 className="text-xl font-semibold text-white">Search GIFs</h2>
        </div>
        <div className="p-4">
          {contentUI}
        </div>
      </div>
    );
  }

  // Standard dialog mode
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="hover:bg-zinc-700"
        >
          {buttonContent}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-hidden flex flex-col bg-zinc-800 border border-zinc-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Search GIFs</DialogTitle>
        </DialogHeader>
        {contentUI}
      </DialogContent>
    </Dialog>
  );
}