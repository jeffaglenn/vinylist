# Vinyl Collection App - TODO

## 🟥 High Priority Issues

### Album Art Storage Cleanup
**Status**: ✅ Completed
**Description**: When albums are deleted, the cover art images remain in the Supabase `album-art` storage bucket
**Impact**: Storage costs will accumulate over time with orphaned files
**Resolution**: Storage deletion now works for both album edit (removal/replacement) and album deletion. Orphaned files are properly cleaned up.
**Current State**:
- Database deletion works properly
- UI updates correctly
- Storage API `.remove()` calls now succeed and files are deleted as expected
- Service role key is configured correctly

---

## 🟡 Medium Priority Improvements

### User Experience Enhancements
- [ ] Add loading states for album deletion operations
- [ ] Implement bulk album deletion (select multiple albums)
- [ ] Add "Are you sure?" double confirmation for deletions
- [ ] Show progress indicator during image uploads
- [ ] Add toast notifications for successful/failed operations

### Album Management Features
- [✅] Add album editing functionality (update details, replace cover art) - Completed
- [ ] Implement album search/filtering by artist, year, genre
- [ ] Add sorting options (alphabetical, date added, release year)
- [ ] Create album favorites/wishlist feature
- [✅] Add album duplicate detection - Artist autocomplete prevents duplicates

### Data Import/Export
- [ ] CSV export of album collection
- [ ] CSV import for bulk album additions
- [✅] Integration with music databases (MusicBrainz) - Text search implemented with auto-fill
- [ ] Backup/restore collection functionality

---

## 🟢 Low Priority / Nice to Have

### UI/UX Polish
- [ ] Add dark mode toggle
- [ ] Implement responsive design improvements for mobile
- [ ] Add album grid view size options (small, medium, large)
- [ ] Create album detail modal/page with expanded information
- [ ] Add album condition history tracking

### Analytics & Insights
- [ ] Collection value estimation (integrate with market data)
- [ ] Collection statistics dashboard
- [ ] Purchase date tracking and spending analysis
- [ ] Genre distribution charts
- [ ] Collection growth over time graphs

### Advanced Features
- [❌] Barcode scanning for quick album addition - Removed due to mobile compatibility issues, can revisit later
- [ ] Integration with streaming services (Spotify, Apple Music)
- [ ] Sharing collections with other users
- [ ] Album recommendation engine
- [ ] Loan tracking (track albums lent to friends)

---

## 🔧 Technical Debt & Optimizations

### Performance
- [ ] Implement image optimization and lazy loading
- [ ] Add pagination for large collections
- [ ] Optimize database queries (add proper indexes)
- [ ] Implement client-side caching for album data

### Code Quality
- [ ] Add comprehensive error handling across all components
- [ ] Implement proper TypeScript types for all API responses
- [ ] Add unit tests for critical functions
- [ ] Set up end-to-end testing for user flows

### Security & Monitoring
- [ ] Add rate limiting for API endpoints
- [ ] Implement audit logging for sensitive operations
- [ ] Add error monitoring and alerting
- [ ] Review and strengthen RLS policies

### DevOps
- [ ] Set up CI/CD pipeline
- [ ] Add database migration system
- [ ] Implement proper environment management
- [ ] Add monitoring and health checks

---

## 📝 Notes

### Current Architecture
- **Frontend**: Next.js 15 with React Server Components
- **Backend**: Next.js API routes
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS
- **Music Database**: MusicBrainz API integration for album search
- **Cover Art**: Cover Art Archive integration for automatic artwork

### Key Files to Remember
- `src/app/api/albums/[id]/route.ts` - Album deletion API (storage cleanup implemented)
- `src/app/api/search-albums/route.ts` - MusicBrainz search integration
- `src/app/api/cover-art/route.ts` - Cover Art Archive integration
- `src/app/api/artists/route.ts` - Artist autocomplete API
- `src/components/albums/AlbumGrid.tsx` - Main album display component
- `src/components/albums/ManualAlbumForm.tsx` - Album creation with search integration
- `src/components/ui/ConfirmationDialog.tsx` - Reusable confirmation dialog
- `.env.local` - Environment configuration (service role key)
- `next.config.ts` - Image domains for Cover Art Archive

### Database Schema Notes
- Albums table has `is_active` column for soft deletes (currently using hard deletes)
- Cover art URLs are stored as full Supabase Storage URLs
- User ownership is enforced through RLS policies

---

## 🆕 Recent Completed Features

### MusicBrainz Integration (Latest)
- ✅ **Album Search**: Search MusicBrainz database by artist/album name
- ✅ **Auto-fill Forms**: Click search results to populate album details
- ✅ **Cover Art**: Automatic fetching from Cover Art Archive
- ✅ **Artist Autocomplete**: Prevents duplicate artist names across collection
- ✅ **Mobile-friendly**: Works on all devices via text search

### Navigation Improvements
- ✅ **Next.js Link Components**: Fixed page reload issues on first click
- ✅ **Proper Client-side Routing**: Smooth navigation between pages
- ✅ **Collection Redirect**: Adding albums now redirects to collection page

### Barcode Scanning Attempt
- ❌ **Removed**: Mobile camera compatibility issues with both Quagga2 and html5-qrcode
- 📋 **Future Consideration**: Can revisit with different approach or library

---

*Last updated: December 2024*