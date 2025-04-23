import { useState, useEffect, useCallback } from 'react'
import style from './sounds.module.scss'
import VoiceListItem from '@/components/voice-list-item'
import v from '@/assets/sound1.json'
import { UseScrollToBottom } from '@/components/scroll-to-bottom'
import { showLoading, hideLoading } from '@/components/loading'
import { toastSuccess, toastError } from '@/components/toast'
import { univoice_dapp_backend } from 'declarations/univoice-dapp-backend'
import { queryVoiceOnline, voice_delete } from '@/utils/voiceossbuss'
import { Principal } from '@dfinity/principal'
import { reConnectPlug } from '@/utils/icplug'

// Add TypeScript interface for the global window object with Internet Computer
declare global {
  interface Window {
    ic?: {
      plug?: {
        principalId?: string;
        isConnected?: () => Promise<boolean>;
        requestConnect?: (options?: any) => Promise<boolean>;
        getPrincipal?: () => Promise<any>;
        createActor?: (canisterId: string, options?: any) => Promise<any>;
        deleteAgent?: () => void;
        disconnect?: () => Promise<void>;
      };
    };
  }
}

function SoundsPage() {
  const [voicesData, setVoicesData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMoreData, setHasMoreData] = useState(true)
  const pageSize = 10 // Fixed page size

  const loadMore = useCallback(() => {
    if (!isLoading && hasMoreData) {
      setCurrentPage(prevPage => prevPage + 1)
      queryVoices(currentPage + 1)
    }
  }, [currentPage, isLoading, hasMoreData]);

  const containerRef = UseScrollToBottom({
    callback: loadMore,
    offset: 50
  });

  useEffect(() => {
    queryVoices(1)
  }, []);

  const onDelete = async (item: any, index: number) => {
    showLoading()
    try {
      // Call voice_delete from voiceossbuss.tsx
      const principalId = window.ic?.plug?.principalId || '';
      const result = await voice_delete(item.prd_id, principalId)
      hideLoading()

      if (result) {
        toastSuccess('Delete success');
        // Remove the item from the list
        const updatedVoices = [...voicesData];
        updatedVoices.splice(index, 1);
        setVoicesData(updatedVoices);
      } else {
        toastError('Failed to delete voice file');
      }
    } catch (error) {
      console.log('🚀 ~ onDelete ~ error:', error);
      hideLoading()
      toastError('Something went wrong, please try again');
    }
  };

  const queryVoices = async (pageNum: number) => {
    if (isLoading) return;
    
    setIsLoading(true);
    showLoading()
    
    try {
      // Get the principal ID from the authenticated user
      const principalId = window.ic?.plug?.principalId || '';
      
      if (!principalId) {
        console.log('No principal ID available, attempting to reconnect Plug wallet');
        try {
          // Import and use reConnectPlug from icplug.tsx to re-authenticate
          const newPrincipalId = await reConnectPlug();
          if (newPrincipalId) {
            console.log('Successfully reconnected with Plug, principal ID:', newPrincipalId);
            // Continue with the newly obtained principal ID
            const data = await queryVoiceOnline(newPrincipalId, pageNum, pageSize);
            console.log('🚀 ~ queryVoices ~ data:', data);
            hideLoading();
            setIsLoading(false);
            
            handleQueryResult(data, pageNum);
            return;
          } else {
            console.error('Failed to get principal ID after reconnection');
          }
        } catch (error) {
          console.error('Error reconnecting with Plug wallet:', error);
          // Fall back to mock data if reconnection fails
          useMockData(pageNum);
          return;
        }
      }
      
      // Call the queryVoiceOnline function with page-based pagination
      const data = await queryVoiceOnline(principalId, pageNum, pageSize);
      console.log('🚀 ~ queryVoices ~ data:', data);

      hideLoading()
      setIsLoading(false);
      
      handleQueryResult(data, pageNum);
    } catch (error) {
      console.error('Error fetching voice data:', error);
      hideLoading()
      setIsLoading(false);
      toastError('Failed to load voice data');
      
      // Fallback to mock data
      useMockData(pageNum);
    }
  }

  // Helper function to handle query results
  const handleQueryResult = (data: any[], pageNum: number) => {
    if (data && data.length > 0) {
      if (pageNum === 1) {
        // For first page, replace the data
        setVoicesData(data);
      } else {
        // For subsequent pages, append the data
        setVoicesData(prevData => [...prevData, ...data]);
      }
      
      // Check if we have more data to load (if we got fewer items than requested)
      setHasMoreData(data.length >= pageSize);
    } else if (pageNum === 1) {
      // If no data for first page, show empty state
      setVoicesData([]);
      setHasMoreData(false);
    } else {
      // No more data in subsequent pages
      setHasMoreData(false);
    }
  }

  // Function to use mock data as fallback
  const useMockData = (pageNum: number) => {
    // For mock data, generate some placeholder items
    const mockData = Array.from({ length: 5 }, (_, i) => {
      const uniqueId = (pageNum - 1) * pageSize + i + 1;
      return {
        prd_id: uniqueId,
        file_obj: v.data,
        gmt_create: new Date().getTime() - i * 100000,
        icon: '',
        timestamp: new Date().getTime() - i * 100000,
        file_id: uniqueId
      };
    });
    
    handleQueryResult(mockData, pageNum);
    
    hideLoading();
    setIsLoading(false);
  }

  return (
    <div className={style.pgMyvoice} ref={containerRef}>
      <div className="page-name">My Voices</div>
      {voicesData.length === 0 ? 
      <div className="nodata">
        <div className="nodata-txt">You haven't Voices yet</div>
      </div>
      :
      <div className={style.myvoiceList}>
        {voicesData.map((item, index) => {
          return (
            <VoiceListItem
              item={item}
              key={`item_keys_${item.prd_id}_${index}`}
              index={index}
              onDelete={onDelete}
            />
          );
        })}
      </div>
      }
    </div>
  );
}
  
export default SoundsPage;