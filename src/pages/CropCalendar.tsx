import { useState, useEffect } from 'react';
import { Calendar, Plus, CheckCircle, Clock, Droplets, Leaf, Bug, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageContainer, PageSection } from '@/components/layout/PageContainer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, parseISO } from 'date-fns';

interface CalendarEvent {
  id: string;
  event_type: string;
  title: string;
  description: string | null;
  scheduled_date: string;
  is_completed: boolean;
}

export default function CropCalendar() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newEvent, setNewEvent] = useState({
    event_type: 'sowing',
    title: '',
    description: '',
    scheduled_date: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    if (user) fetchEvents();
  }, [user, currentMonth]);

  const fetchEvents = async () => {
    try {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      
      const { data, error } = await supabase
        .from('crop_calendar_events')
        .select('*')
        .eq('user_id', user?.id)
        .gte('scheduled_date', format(start, 'yyyy-MM-dd'))
        .lte('scheduled_date', format(end, 'yyyy-MM-dd'))
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!user) return;
    if (!newEvent.title.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Title is required' });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('crop_calendar_events').insert({
        user_id: user.id,
        event_type: newEvent.event_type,
        title: newEvent.title,
        description: newEvent.description || null,
        scheduled_date: newEvent.scheduled_date,
      });

      if (error) throw error;

      toast({ title: 'Success', description: 'Event added!' });
      setIsDialogOpen(false);
      setNewEvent({
        event_type: 'sowing',
        title: '',
        description: '',
        scheduled_date: format(new Date(), 'yyyy-MM-dd'),
      });
      fetchEvents();
    } catch (error: any) {
      console.error('Failed to create event:', error);
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to create event' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleComplete = async (event: CalendarEvent) => {
    try {
      const { error } = await supabase
        .from('crop_calendar_events')
        .update({ 
          is_completed: !event.is_completed,
          completed_at: !event.is_completed ? new Date().toISOString() : null,
        })
        .eq('id', event.id);

      if (error) throw error;
      fetchEvents();
    } catch (error) {
      console.error('Failed to update event:', error);
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'sowing': return <Leaf className="w-4 h-4" />;
      case 'fertilizer': return <span>🧪</span>;
      case 'irrigation': return <Droplets className="w-4 h-4" />;
      case 'pesticide': return <Bug className="w-4 h-4" />;
      case 'harvest': return <span>🌾</span>;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'sowing': return 'bg-success/20 text-success';
      case 'fertilizer': return 'bg-info/20 text-info';
      case 'irrigation': return 'bg-blue-500/20 text-blue-600';
      case 'pesticide': return 'bg-warning/20 text-warning';
      case 'harvest': return 'bg-amber-500/20 text-amber-600';
      default: return 'bg-muted';
    }
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const getEventsForDate = (date: Date) => {
    return events.filter(e => isSameDay(parseISO(e.scheduled_date), date));
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <PageContainer>
      <AppHeader title="Crop Calendar" />

      {/* Month Navigation */}
      <PageSection>
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addDays(currentMonth, -30))}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-semibold">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addDays(currentMonth, 30))}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
          {Array.from({ length: days[0].getDay() }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map((day) => {
            const dayEvents = getEventsForDate(day);
            const isSelected = isSameDay(day, selectedDate);
            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`p-2 text-sm rounded-lg transition-all relative ${
                  isSelected 
                    ? 'bg-primary text-primary-foreground' 
                    : isToday(day)
                    ? 'bg-secondary font-bold'
                    : 'hover:bg-secondary'
                }`}
              >
                {format(day, 'd')}
                {dayEvents.length > 0 && (
                  <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                    isSelected ? 'bg-primary-foreground' : 'bg-primary'
                  }`} />
                )}
              </button>
            );
          })}
        </div>
      </PageSection>

      {/* Add Event Button */}
      <PageSection>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full h-12 gap-2">
              <Plus className="w-5 h-5" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Calendar Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Event Type</Label>
                <Select 
                  value={newEvent.event_type} 
                  onValueChange={(v) => setNewEvent({ ...newEvent, event_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sowing">🌱 Sowing</SelectItem>
                    <SelectItem value="fertilizer">🧪 Fertilizer Application</SelectItem>
                    <SelectItem value="irrigation">💧 Irrigation</SelectItem>
                    <SelectItem value="pesticide">🐛 Pesticide Spray</SelectItem>
                    <SelectItem value="harvest">🌾 Harvest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  placeholder="e.g., Apply Urea - Wheat Field"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={newEvent.scheduled_date}
                  onChange={(e) => setNewEvent({ ...newEvent, scheduled_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Notes (Optional)</Label>
                <Input
                  placeholder="Additional details..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                />
              </div>
              <Button onClick={handleCreateEvent} disabled={isSubmitting} className="w-full">
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Add Event
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageSection>

      {/* Selected Date Events */}
      <PageSection title={format(selectedDate, 'EEEE, MMMM d')}>
        {selectedDateEvents.length > 0 ? (
          <div className="space-y-3">
            {selectedDateEvents.map((event) => (
              <Card key={event.id} className={event.is_completed ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleComplete(event)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        event.is_completed
                          ? 'bg-success text-success-foreground'
                          : 'border-2 border-muted-foreground/30'
                      }`}
                    >
                      {event.is_completed && <CheckCircle className="w-5 h-5" />}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge className={getEventTypeColor(event.event_type)} variant="secondary">
                          {getEventTypeIcon(event.event_type)}
                          <span className="ml-1 capitalize">{event.event_type}</span>
                        </Badge>
                      </div>
                      <h3 className={`font-semibold mt-1 ${event.is_completed ? 'line-through' : ''}`}>
                        {event.title}
                      </h3>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-muted/50">
            <CardContent className="p-6 text-center">
              <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No events scheduled</p>
            </CardContent>
          </Card>
        )}
      </PageSection>

      {/* Upcoming Events */}
      <PageSection title="Upcoming Tasks">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {events
              .filter(e => !e.is_completed && parseISO(e.scheduled_date) >= new Date())
              .slice(0, 5)
              .map((event) => (
                <Card key={event.id}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getEventTypeColor(event.event_type)}`}>
                      {getEventTypeIcon(event.event_type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(event.scheduled_date), 'MMM d')}
                      </p>
                    </div>
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </PageSection>

      <BottomNav />
    </PageContainer>
  );
}
